let subscribers = [];
let timeout;

function onResize() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        subscribers.forEach(callback => callback());
    }, 100); // Debouncing with 100ms delay
}

window.addEventListener('resize', onResize);

export function subscribe(callback) {
    subscribers.push(callback);
    return () => {
        subscribers = subscribers.filter(sub => sub !== callback);
    };
}
