const mani = {
  el: this,
  // Cria elemento filho
  add(child) {
    el = this.appendChild(child);
    return this;
  },
  // adiciona e remove classe
  hide() {
    this.classList.remove("show");
    this.classList.add("hide");
    return this;
  },
  show() {
    this.classList.remove("hide");
    this.classList.add("show");
    return this;
  },
};

Element.prototype = Object.assign(Element.prototype, mani);
(() => {
  const selector = (selector) => document.querySelector(selector);
  const create = (elementTag) =>
    app.appendChild(document.createElement(elementTag));

  const app = selector("#app");

  const Login = create("div");
  Login.classList.add("login");

  const Logo = create("img");
  Logo.src = "./assets/images/logo.svg";
  Logo.classList.add("logo");

  /* Form */
  const Form = create("form");

  Form.onsubmit = async (e) => {
    e.preventDefault();

    const [email, password] = e.target.children;

    const { url } = await fakeAuthenticate(email.value, password.value);

    location.href = "#users";

    const users = await getDevelopersList(url);

    renderPageUsers(users);
  };

  Form.oninput = (e) => {
    const [email, password, button] = e.target.parentElement.children;
    !email.validity.valid || !email.value || password.value.length <= 5
      ? button.setAttribute("disabled", "disabled")
      : button.removeAttribute("disabled");
  };

  Form.innerHTML = `
      <input type="email" name="login" value="" class="f_input" placeholder="Entre com seu e-mail"> 
      <input type="password" name="senha" value="" class="f_input" placeholder="Digite sua senha supersecreta" >
      <button type="submit" name="enviar" class="f_button" disabled="disabled" > Entrar </button> 
      `;

  app.add(Logo);
  Login.add(Form);

  async function fakeAuthenticate(email, password) {
    const data = await fetch(
      "http://www.mocky.io/v2/5dba690e3000008c00028eb6",
      { method: "GET" }
    ).then(function (response) {
      return response.json();
    });

    const fakeJwtToken = `${btoa(email + password)}.${btoa(data.url)}.${
      new Date().getTime() + 300000
    }`;
    localStorage.setItem("token", fakeJwtToken);
    return data;
  }

  async function getDevelopersList(url) {
    Form.hide();
    const data = await fetch(url, { method: "GET" }).then(function (response) {
      return response.json();
    });

    return data;
  }
  function renderPageUsers(users) {
    app.classList.add("logged");
    Login.style.display = "none";
    Logo.style.top = "2rem";

    const Ul = create("ul");
    Ul.classList.add("users_ul");

    users
      .map((user) => {
        const li = create("li");
        li.classList.add("user_li");

        const avatar = create("img");
        avatar.src = user.avatar_url;

        const username = document.createTextNode(user.login);

        li.appendChild(avatar);
        li.appendChild(username);
        return li;
      })
      .reduce((prev, curr) => {
        return prev.add(curr);
      }, Ul);

    app.add(Ul);
    Form.show();
  }

  // init
  (async function () {
    const rawToken = localStorage.getItem("token");
    const token = rawToken ? rawToken.split(".") : null;
    if (!token || token[2] < new Date().getTime()) {
      localStorage.removeItem("token");
      location.href = "#login";
      app.add(Login);
    } else {
      location.href = "#users";
      const users = await getDevelopersList(atob(token[1]));
      renderPageUsers(users);
    }
  })();
})();
