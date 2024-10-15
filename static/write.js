const header = document.querySelector("header");
const loginedHeader = (nickname) => `
<h1
class="text-lg font-medium"
onclick="location.href='/index.html'"
>
HELLO, ${nickname}!
</h1>
<div class="flex gap-2.5">
<button
  class="bg-[#FFFFFF] text-[#4b5966] rounded-lg px-4 py-2 border-none focus:outline-none gap-2.5"
  onclick="location.href='/member.html'"
>
  멤버리스트
</button>
<button
  class="bg-[#4362d0] text-white rounded-lg px-4 py-2 border-none focus:outline-none gap-2.5"
  onclick="location.href='/index.html'"
>
  마이페이지
</button>
<button
  id="logoutButton"
  class="bg-[#4362d0] text-white rounded-lg px-4 py-2 border-none focus:outline-none gap-2.5"
>
  로그아웃
</button>
</div>
`;

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) return;
  fetch(`/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      header.innerHTML = loginedHeader(data.nickname);
    })
    .catch((err) => {
      window.location.href = "/login.html?redirectUrl=/write.html";
    });
});

const form = document.querySelector("form");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    alert("제목과 내용을 모두 입력해주세요.");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login.html";
    return;
  }

  try {
    const response = await fetch("/board", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

    if (response.status === 201) {
      window.location.href = "/";
    } else {
      throw new Error("게시글 작성에 실패했습니다.");
    }
  } catch (error) {
    console.error("에러 발생:", error);
    alert("게시글 작성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
});
