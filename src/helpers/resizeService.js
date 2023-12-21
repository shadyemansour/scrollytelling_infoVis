let subscribers = [];
let timeout;

function onResize() {
    console.log('resized with debounce');
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        subscribers.forEach(callback => callback());
    }, 100); // Debouncing with 100ms delay
}

window.addEventListener('resize', onResize);

export function subscribeResize(callback) {
    subscribers.push(callback);
    return () => {
        subscribers = subscribers.filter(sub => sub !== callback);
    };
}
