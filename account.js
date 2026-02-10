// Инициализация аккаунтов (имитация accounts.json через localStorage)
let accounts = JSON.parse(localStorage.getItem('accounts') || '{}');

const nickInput = document.getElementById('nickInput');
const passwordInput = document.getElementById('passwordInput'); // новое поле
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginMessage = document.getElementById('loginMessage');
const loginContainer = document.getElementById('login-container');
const mainSite = document.getElementById('main-site');

let currentNick = null;

// Регистрация
registerBtn.onclick = async () => {
  const nick = nickInput.value.trim();
  const password = passwordInput.value.trim();

  if (!nick) return loginMessage.textContent = 'Введите ник';
  if (!password) return loginMessage.textContent = 'Введите пароль';

  if (accounts[nick]) {
    loginMessage.textContent = 'Такой ник уже существует';
    return;
  }

  // Сохраняем локально
  accounts[nick] = { password, created: Date.now() };
  localStorage.setItem('accounts', JSON.stringify(accounts));
  currentNick = nick;

  // Отправляем на сервер
  try {
    const res = await fetch('http://localhost:8765/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nick, password })
    });

    if (!res.ok) {
      loginMessage.textContent = 'Ошибка регистрации на сервере';
      return;
    }

    const json = await res.json();
    console.log(json.message); // например: "Аккаунт создан на сервере"
    enterSite();
  } catch (e) {
    loginMessage.textContent = 'Сервер недоступен';
    console.error(e);
  }
};

// Вход
loginBtn.onclick = () => {
  const nick = nickInput.value.trim();
  const password = passwordInput.value.trim();

  if (!nick) return loginMessage.textContent = 'Введите ник';
  if (!password) return loginMessage.textContent = 'Введите пароль';

  if (!accounts[nick]) {
    loginMessage.textContent = 'Такого ника нет. Зарегистрируйтесь';
    return;
  }

  if (accounts[nick].password !== password) {
    loginMessage.textContent = 'Неверный пароль';
    return;
  }

  currentNick = nick;
  enterSite();
};

// Проверка текущей сессии
window.addEventListener('DOMContentLoaded', () => {
  const saved = JSON.parse(localStorage.getItem('currentUser'));
  if (saved && saved.expiry > Date.now()) {
    // Сессия действительна
    currentNick = saved.nick;
    loginContainer.style.display = 'none';
    mainSite.style.display = 'block';
    console.log(`С возвращением, ${currentNick}!`);
  } else {
    // Сессия истекла или нет пользователя
    localStorage.removeItem('currentUser');
    loginContainer.style.display = 'flex';
    mainSite.style.display = 'none';
  }
});

function logout() {
  // Убираем текущую сессию
  localStorage.removeItem('currentUser');
  currentNick = null;

  // Показать экран логина, скрыть основной сайт
  loginContainer.style.display = 'flex';
  mainSite.style.display = 'none';

  console.log('Вы вышли из аккаунта');
}

// Функция показа основного сайта
function enterSite() {
  loginContainer.style.display = 'none'; // скрываем логин
  mainSite.style.display = 'block';      // показываем основной контент

  // Сохраняем в localStorage
  const sessionDuration = 24 * 60 * 60 * 1000; // сессия 24 часа
  const expiry = Date.now() + sessionDuration;
  localStorage.setItem('currentUser', JSON.stringify({ nick: currentNick, expiry }));

  // Приветствие
  console.log(`Добро пожаловать, ${currentNick}!`);
}
