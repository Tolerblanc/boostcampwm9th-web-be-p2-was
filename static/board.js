let boardId;
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

document
  .getElementById("commentForm")
  .addEventListener("submit", createComment);
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const boardId = urlParams.get("id");
  if (!boardId) {
    alert("잘못된 접근입니다.");
    window.location.href = "/index.html";
  }
  fetchBoardDetail(boardId);
  document.getElementById("loginButton").addEventListener("click", () => {
    window.location.href = `login.html?redirectUrl=/board.html?id=${boardId}`;
  });

  const token = localStorage.getItem("token");
  if (token) {
    fetch(`/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        header.innerHTML = loginedHeader(data.nickname);
        document.getElementById("currentUser").innerText = data.nickname;
        setupLogoutButton();
      })
      .catch((err) => {
        console.error(err);
        document.getElementById("currentUser").innerText =
          "댓글을 작성하려면 로그인하세요.";

        const userInput = document.getElementById("userInput");
        userInput.disabled = true;
        userInput.placeholder = "";
        userInput.style.backgroundColor = "inherit";
        userInput.style.color = "#999";

        const submitButton = document.querySelector(
          "#commentForm button[type='submit']"
        );
        submitButton.disabled = true;
        submitButton.classList.add("opacity-50", "cursor-not-allowed");
      });
  }
});

function fetchBoardDetail(boardId) {
  fetch(`/board/${boardId}`)
    .then((res) => res.json())
    .then((data) => {
      renderBoardDetail(data);
    })
    .catch((err) => {
      console.error(err);
    });
}

function renderBoardDetail(data) {
  boardId = data.id;
  document.getElementById("title").innerText = data.title;
  document.getElementById("content").innerText = data.content;
  document.getElementById("viewCount").innerText = data.viewCount;
  document.getElementById("author").innerText = data.author.nickname;
  document.getElementById("createdAt").innerText = new Date(
    data.createdAt
  ).toLocaleDateString();
  document.getElementById("commentCount").innerText = data.comments.length;

  renderComments(data.comments);
}

// 댓글 렌더링 함수
function renderComments(comments) {
  const commentList = document.getElementById("commentList");
  commentList.innerHTML = "";

  comments.forEach((comment) => {
    const li = document.createElement("li");
    li.className = "border-b border-gray-200 pb-4";
    li.innerHTML = `
      <div class="flex flex-col gap-2">
        <span class="font-medium text-[#4362d0]">${comment.author.nickname}</span>
        <p>${comment.content}</p>
        <span class="text-sm text-gray-500">${new Date(comment.createdAt).toLocaleString()}</span>
      </div>
    `;
    commentList.appendChild(li);
  });
}

function createComment(event) {
  event.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("로그인이 필요합니다.");
    return;
  }

  const content = document.getElementById("userInput").value;
  if (!content.trim()) {
    alert("댓글 내용을 입력해주세요.");
    return;
  }

  fetch(`/comment/${boardId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  })
    .then((res) => res.json())
    .then((newComment) => {
      document.getElementById("userInput").value = "";
      fetchBoardDetail(boardId); // 게시글 상세 정보를 다시 불러와 댓글 목록 갱신
    })
    .catch((err) => {
      console.error("댓글 작성 중 오류 발생:", err);
      alert("댓글 작성에 실패했습니다.");
    });
}

function setupLogoutButton() {
  const logoutButton = document.getElementById("logoutButton");
  if (!logoutButton) {
    return;
  }
  logoutButton.addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("토큰이 없습니다. 이미 로그아웃 상태일 수 있습니다.");
      location.href = "/index.html";
      return;
    }
    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        location.href = "/index.html";
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  });
}
