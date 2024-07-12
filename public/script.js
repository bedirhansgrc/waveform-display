const socket = io();
const waveformBoxes = document.querySelectorAll('.waveform-box');
const indexLabels = {};

document.addEventListener('DOMContentLoaded', () => {
  waveformBoxes.forEach(box => {
    const indexLabel = box.querySelector('.index-label');
    const socketId = box.getAttribute('socketid');
    if (indexLabels[socketId]) {
      indexLabel.innerText = indexLabels[socketId];
    }
    indexLabel.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = indexLabel.innerText;
      input.classList.add('index-input');
      
      input.addEventListener('blur', () => {
        indexLabel.innerText = input.value;
        indexLabels[socketId] = input.value; // Değiştirilen değeri sakla
        indexLabel.style.display = 'block';
        input.remove();
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          input.blur();
        }
      });

      indexLabel.style.display = 'none';
      box.appendChild(input);
      input.focus();
    });
  });
});

socket.on('message', (data) => {
  const parsedMessage = parseMessage(data.message);
  if (!parsedMessage) {
    console.error('Failed to parse message');
    return;
  }

  const displayContent = parsedMessage.content;
  updateWaveformDisplay(parsedMessage.socketid, displayContent);
});

function parseMessage(message) {
  const commaIndex = message.indexOf(',');
  if (commaIndex !== -1 && message.startsWith('[') && message.endsWith(']')) {
    const socketid = message.slice(1, commaIndex);
    const content = message.slice(commaIndex + 1, -1);
    return { socketid, content };
  }
  return null;
}

function updateWaveformDisplay(socketid, message) {
  const targetBox = Array.from(waveformBoxes).find(box => box.getAttribute('socketid') === socketid);
  if (!targetBox) {
    console.warn(`No waveform box found for socketid ${socketid}`);
    return;
  }

  targetBox.innerHTML = `<div class="index-label">${indexLabels[socketid] || socketid}</div>`;

  const fragmentSDA = document.createDocumentFragment();
  const fragmentHex = document.createDocumentFragment();

  let previousBit = null;
  let hexIndex = 0;
  for (let i = 0; i < message.length; i++) {
    const bit = message[i];

    const bitContainer = document.createElement('div');
    bitContainer.style.display = 'inline-block';
    bitContainer.style.position = 'relative';
    bitContainer.style.height = '70px';
    bitContainer.style.width = '20px';

    const verticalLine = document.createElement('div');
    verticalLine.style.position = 'absolute';
    verticalLine.style.width = '2px';
    verticalLine.style.backgroundColor = 'grey';

    const horizontalLine = document.createElement('div');
    horizontalLine.style.position = 'absolute';
    horizontalLine.style.height = '2px';
    horizontalLine.style.width = '100%';

    if (bit === '0') {
      horizontalLine.style.bottom = '20px';
      horizontalLine.style.backgroundColor = 'red';
      if (previousBit === '1') {
        verticalLine.style.top = '0';
        verticalLine.style.height = 'calc(100% - 20px)';
      } else {
        verticalLine.style.display = 'none';
      }
    } else if (bit === '1') {
      horizontalLine.style.top = '0';
      horizontalLine.style.backgroundColor = 'green';
      if (previousBit === '0') {
        verticalLine.style.bottom = '20px';
        verticalLine.style.height = 'calc(100% - 20px)';
      } else {
        verticalLine.style.display = 'none';
      }
    }

    const bitLabel = document.createElement('div');
    bitLabel.style.position = 'absolute';
    bitLabel.style.bottom = '0';
    bitLabel.style.width = '100%';
    bitLabel.style.textAlign = 'center';
    bitLabel.innerText = bit;

    bitContainer.appendChild(verticalLine);
    bitContainer.appendChild(horizontalLine);
    bitContainer.appendChild(bitLabel);

    fragmentSDA.appendChild(bitContainer);

    if ((i + 1) % 8 === 0) {
      const byte = message.slice(i - 7, i + 1);
      const hexValue = parseInt(byte, 2).toString(16).toUpperCase();
      const hexContainer = document.createElement('div');
      hexContainer.classList.add('hex-box');
      hexContainer.innerText = hexValue;
      fragmentHex.appendChild(hexContainer);
      hexIndex++;
    }

    previousBit = bit;
  }

  const sdaWaveform = document.createElement('div');
  sdaWaveform.classList.add('waveform-row');
  sdaWaveform.innerHTML = '<div class="waveform-label"></div>';
  sdaWaveform.appendChild(fragmentSDA);
  targetBox.appendChild(sdaWaveform);

  const hexWaveform = document.createElement('div');
  hexWaveform.classList.add('waveform-row');
  hexWaveform.innerHTML = '<div class="waveform-label">Hex:</div>';
  hexWaveform.appendChild(fragmentHex);
  targetBox.appendChild(hexWaveform);

  const indexLabel = targetBox.querySelector('.index-label');
  indexLabel.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = indexLabel.innerText;
    input.classList.add('index-input');
    
    input.addEventListener('blur', () => {
      indexLabel.innerText = input.value;
      indexLabels[socketid] = input.value;
      indexLabel.style.display = 'block';
      input.remove();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      }
    });

    indexLabel.style.display = 'none';
    targetBox.appendChild(input);
    input.focus();
  });
}
