import browser from './browser';

export function connect() {
  return browser.runtime.connect({name: 'jf'});
}

export function listen(onMessageReceived) {
  browser.runtime.onConnect.addListener((port) => {
    if (port.name !== 'jf') {
      console.log(`JSON Formatter error - unknown port name ${port.name}`, port);
      return;
    }

    port.onMessage.addListener((...args) => onMessageReceived(port, ...args));
  });
}
