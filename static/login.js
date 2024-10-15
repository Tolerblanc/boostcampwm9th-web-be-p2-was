const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const loginForm = document.querySelector("form");

function checkInputs() {
  if (emailInput.value.trim() !== "" && passwordInput.value.trim() !== "") {
    loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}

emailInput.addEventListener("input", checkInputs);
passwordInput.addEventListener("input", checkInputs);

checkInputs();

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = {
    email: emailInput.value,
    password: passwordInput.value,
  };

  fetch("/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(response.statusText);
      }
    })
    .then((data) => {
      localStorage.setItem("token", data.token);
      window.location.href = data.redirectUrl;
    })
    .catch((error) => {
      console.error("에러 발생:", error);
      alert("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    });
});
