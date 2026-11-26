# 畫中有話卡圖第 2 步：油畫（一筆一筆落）：python3 paint.py raw painted [闊=540]；r000.png → c000.webp（號碼仍然係場景號碼）
# 學畫家：先大筆掃底，再一層層細筆；細筆只落喺同原圖差得遠嘅位（邊、細節）；每筆係沿住畫面方向嘅橢圓，有色差同高光
# 最後加厚塗光影、畫布紋理、暖色、暗角
import sys, os, glob
import cv2, numpy as np

def flow_angle(img, rng, sigma=7):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    g = cv2.GaussianBlur(g, (0, 0), 2.5)
    gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3)
    jxx = cv2.GaussianBlur(gx * gx, (0, 0), sigma); jyy = cv2.GaussianBlur(gy * gy, (0, 0), sigma); jxy = cv2.GaussianBlur(gx * gy, (0, 0), sigma)
    th = 0.5 * np.arctan2(2 * jxy, jxx - jyy) + np.pi / 2
    lam = np.sqrt((jxx - jyy) ** 2 + 4 * jxy ** 2)
    h, w = g.shape
    n = cv2.resize(rng.random((max(2, h // 160), max(2, w // 160))).astype(np.float32), (w, h), interpolation=cv2.INTER_CUBIC)
    th2 = np.deg2rad(8) + (n - 0.5) * 1.1          # 平坦位：差唔多打橫、輕輕起伏，似掃天空
    k = np.clip(lam * 120, 0, 1)
    c = k * np.cos(th) + (1 - k) * np.cos(th2); s = k * np.sin(th) + (1 - k) * np.sin(th2)
    return np.degrees(np.arctan2(s, c)).astype(np.float32)

def paint(ref, seed=1):
    rng = np.random.default_rng(seed)
    h, w = ref.shape[:2]
    ang = flow_angle(ref, rng)
    ref_f = ref.astype(np.float32)
    canvas = cv2.GaussianBlur(ref, (0, 0), 24).astype(np.float32)
    layers = [(24, 0, 1.0), (14, 7, 1.0), (7.5, 9, 1.0), (4, 11, 1.0), (2.2, 14, 1.0)]
    for R, thr, alpha in layers:
        blur = cv2.GaussianBlur(ref_f, (0, 0), max(0.5, R / 4.5))
        diff = np.linalg.norm(canvas - blur, axis=2)
        step = max(2, int(R * 0.9))
        ys, xs = np.mgrid[step // 2:h:step, step // 2:w:step]
        xs = np.clip(xs + rng.integers(-step // 2, step // 2 + 1, xs.shape), 0, w - 1)
        ys = np.clip(ys + rng.integers(-step // 2, step // 2 + 1, ys.shape), 0, h - 1)
        # 細筆：用格入面最唔似嘅位（保留細節）
        sel = diff[ys, xs] > thr if thr else np.ones(xs.shape, bool)
        xs, ys = xs[sel], ys[sel]
        order = rng.permutation(len(xs))
        layer = canvas.copy()
        for i in order:
            x, y = int(xs[i]), int(ys[i])
            col = blur[y, x] * rng.uniform(0.97, 1.03) + rng.normal(0, 3.5, 3)
            a = float(ang[y, x] + rng.normal(0, 7))
            L = R * rng.uniform(1.5, 2.4); W = R * rng.uniform(0.5, 0.72)
            cv2.ellipse(layer, (x, y), (max(1, int(L)), max(1, int(W))), a, 0, 360, col.tolist(), -1, cv2.LINE_AA)
            if R >= 6:   # 筆觸上面一條光邊（顏料厚）
                rad = np.deg2rad(a); ox, oy = -np.sin(rad) * W * 0.45, np.cos(rad) * W * 0.45
                cv2.ellipse(layer, (int(x - ox), int(y - oy)), (max(1, int(L * 0.75)), max(1, int(W * 0.22))), a, 0, 360, (col * 1.07 + 4).tolist(), -1, cv2.LINE_AA)
        canvas = layer * alpha + canvas * (1 - alpha) if alpha < 1 else layer
    out = canvas
    # 亮度、對比對返原圖（筆觸平均咗會暗啲、灰啲）
    for ch in range(3):
        m0, s0 = ref_f[..., ch].mean(), ref_f[..., ch].std(); m1, s1 = out[..., ch].mean(), out[..., ch].std() + 1e-6
        out[..., ch] = (out[..., ch] - m1) * (s0 / s1) + m0
    # 厚塗光影：用筆觸嘅細紋打左上光
    lum = cv2.cvtColor(out.clip(0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    hp = lum - cv2.GaussianBlur(lum, (0, 0), 3)
    nx = cv2.Sobel(hp, cv2.CV_32F, 1, 0, ksize=3); ny = cv2.Sobel(hp, cv2.CV_32F, 0, 1, ksize=3)
    sh = -(nx + ny); sh /= (np.abs(sh).std() * 3 + 1e-6)
    out = out * (1 + 0.12 * np.clip(sh, -1.5, 1.5)[..., None])
    # 畫布紋理
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    weave = np.sin(xx * 2 * np.pi / 4.5) * np.sin(yy * 2 * np.pi / 4.5) * 0.6 + (rng.random((h, w)) - 0.5) * 0.5
    out *= (1 + 0.03 * weave[..., None])
    # 暖色、少少飽和、暗角
    out = out.clip(0, 255).astype(np.uint8)
    hsv = cv2.cvtColor(out, cv2.COLOR_BGR2HSV).astype(np.float32); hsv[..., 1] *= 1.06
    out = cv2.cvtColor(hsv.clip(0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32)
    out[..., 2] *= 1.03; out[..., 0] *= 0.97
    vg = (xx / w - 0.5) ** 2 + (yy / h - 0.5) ** 2 * 0.8
    out *= (1 - np.clip(vg * 0.5, 0, 0.12))[..., None]
    return out.clip(0, 255).astype(np.uint8)

if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]; W = int(sys.argv[3]) if len(sys.argv) > 3 else 540
    os.makedirs(dst, exist_ok=True)
    files = sorted(glob.glob(os.path.join(src, '*.png'))) if os.path.isdir(src) else [src]
    for f in files:
        img = cv2.imread(f)
        nm = os.path.splitext(os.path.basename(f))[0].replace('r', 'c', 1)
        out = paint(img, seed=int(''.join(ch for ch in nm if ch.isdigit()) or 1))
        out = cv2.resize(out, (W, int(W * 1.5)), interpolation=cv2.INTER_AREA)
        cv2.imwrite(os.path.join(dst, nm + '.webp'), out, [cv2.IMWRITE_WEBP_QUALITY, 80])
        print(nm, os.path.getsize(os.path.join(dst, nm + '.webp')) // 1024, 'KB')
