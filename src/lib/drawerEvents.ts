// Simple event emitter for drawer — avoids React context issues
// with Expo Router's screen isolation
type Listener = () => void;

let openListener: Listener | null = null;
let closeListener: Listener | null = null;

export const drawerEvents = {
    setOpenListener(fn: Listener) {
        openListener = fn;
    },
    setCloseListener(fn: Listener) {
        closeListener = fn;
    },
    open() {
        openListener?.();
    },
    close() {
        closeListener?.();
    },
};
