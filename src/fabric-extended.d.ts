import 'fabric';

declare module 'fabric' {
    // Artık 'fabric.Object' yerine 'FabricObject' arayüzünü genişletiyoruz.
    // Bu, kütüphanenin modern export yapısıyla uyumludur.
    interface FabricObject {
        layerId?: string;
    }

    interface Canvas {
        /**
         * Moves an object to the specified index in the collections of objects
         * @param object Object to move
         * @param index Index to move object to
         */
        moveTo(object: FabricObject, index: number): Canvas;

        /**
         * Moves an object to the bottom of the stack of drawn objects
         * @param object Object to send to back
         */
        sendToBack(object: FabricObject): Canvas;

        /**
         * Moves an object to the top of the stack of drawn objects
         * @param object Object to bring to front
         */
        bringToFront(object: FabricObject): Canvas;
    }
}
