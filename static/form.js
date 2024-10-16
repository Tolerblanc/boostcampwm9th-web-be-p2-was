const emailInput = document.getElementById("email");
const nicknameInput = document.getElementById("nickname");
const passwordInput = document.getElementById("password");
const submitButton = document.getElementById("submitButton");
const signupForm = document.getElementById("signupForm");

function checkInputs() {
  if (
    emailInput.value.trim() !== "" &&
    nicknameInput.value.trim() !== "" &&
    passwordInput.value.trim() !== ""
  ) {
    submitButton.disabled = false;
  } else {
    submitButton.disabled = true;
  }
}

emailInput.addEventListener("input", checkInputs);
nicknameInput.addEventListener("input", checkInputs);
passwordInput.addEventListener("input", checkInputs);

checkInputs();

signupForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = {
    email: emailInput.value,
    nickname: nicknameInput.value,
    password: passwordInput.value,
  };

  fetch("/user/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      const success = response.status === 201;

      if (!success) {
        // TODO: 실패 시 예외 처리
        console.error("회원가입 실패");
      }

      document.getElementById("passwordContainer").remove();

      ["email", "nickname"].forEach((id) => {
        const input = document.getElementById(id);
        input.disabled = true;
        input.style.backgroundColor = "#F5F7F9";
        const container = document.getElementById(`${id}Container`);
        container.style.backgroundColor = "#F5F7F9";
      });

      // 버튼 텍스트 변경 및 링크 설정
      const button = document.getElementById("submitButton");
      button.textContent = "지금 로그인하기";
      button.onclick = function () {
        window.location.href = "/login.html";
      };

      document.getElementById("mainTitle").textContent =
        "가입이 완료되었습니다!";
    })
    .catch((error) => {
      console.error("에러 발생:", error);
      // TODO: 사용자에게 에러 메시지 표시
    });
});
