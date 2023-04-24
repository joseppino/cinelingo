// implements a debounce for delaying the trigger of backend processes to save computation
export default function(func, timeout = 2000){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}