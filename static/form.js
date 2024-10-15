document.getElementById("signupForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = {
    email: document.getElementById("email").value,
    nickname: document.getElementById("nickname").value,
    password: document.getElementById("password").value,
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

      if (success) {
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
      } else {
        // TODO: 실패 시 예외 처리
        console.error("회원가입 실패");
      }
    })
    .catch((error) => {
      console.error("에러 발생:", error);
      // TODO: 사용자에게 에러 메시지 표시
    });
});
