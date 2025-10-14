import 'fabric';

declare module 'fabric' {
    // Artık 'fabric.Object' yerine 'FabricObject' arayüzünü genişletiyoruz.
    // Bu, kütüphanenin modern export yapısıyla uyumludur.
    interface FabricObject {
        layerId?: string;
    }
}