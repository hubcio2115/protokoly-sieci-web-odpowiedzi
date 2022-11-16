const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nameInput = document.getElementById('name');
  const surnameInput = document.getElementById('surname');

  const loginName = `${nameInput.value}${surnameInput.value}`;
  const cookiesValue = Cookies.get(loginName);
  console.log(loginName);

  if (loginName && document.getElementById('imie').innerText) return;

  if (cookiesValue) {
    Cookies.set(loginName, 1 + parseInt(cookiesValue));
  } else Cookies.set(loginName, 0);

  login(nameInput.value, surnameInput.value);
});

const login = (name, surname) => {
  const counter = document.getElementById('licznik');
  counter.innerText = `Odwiedzasz naszą stronę ${Cookies.get(
    name + surname,
  )} raz`;

  displayName(name, surname);
};

const displayName = (name, surname) => {
  const imie = document.getElementById('imie');

  imie.innerText = name + ' ' + surname;

  document.getElementById('licznik').style = '';
};

const resetCookies = () => {
  document.cookie.replace(/(?<=^|;).+?(?=\=|;|$)/g, (name) =>
    location.hostname
      .split(/\.(?=[^\.]+\.)/)
      .reduceRight(
        (acc, val, i, arr) =>
          i ? (arr[i] = '.' + val + acc) : ((arr[i] = ''), arr),
        '',
      )
      .map(
        (domain) =>
          (document.cookie = `${name}=;max-age=0;path=/;domain=${domain}`),
      ),
  );
};
