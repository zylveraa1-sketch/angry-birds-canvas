let hintTimer = 0;

export function showHint(txt) {
  const el = document.getElementById('hint');
  el.textContent = txt;
  el.classList.add('show');
  hintTimer = 150;
}

export function tickHint() {
  if (hintTimer > 0) {
    hintTimer--;
    if (hintTimer === 0) document.getElementById('hint').classList.remove('show');
  }
}
