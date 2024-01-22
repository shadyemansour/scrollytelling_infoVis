let subscribers = [];
let lastScrollY = window.scrollY;
let isTicking = false;

window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!isTicking) {
        window.requestAnimationFrame(() => {
            subscribers.forEach(callback => callback(lastScrollY));
            isTicking = false;
        });
        isTicking = true;
    }
});

export function subscribe(callback) {
    subscribers.push(callback);
    return () => {
        subscribers = subscribers.filter(sub => sub !== callback);
    };
}
