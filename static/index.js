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

let currentPage = 1;
const itemsPerPage = 10;

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
      fetchBoardList();
      setupPagination();
      setupWriteButton();
      setupLogoutButton();
    })
    .catch((err) => {
      console.error(err);
    });
});

async function fetchBoardList() {
  try {
    const response = await fetch(
      `/board?page=${currentPage}&limit=${itemsPerPage}`
    );
    const data = await response.json();
    updateBoardTable(data.items);
    updatePagination(data.totalPages);
  } catch (error) {
    console.error("게시글 목록을 가져오는 데 실패했습니다:", error);
  }
}

function updateBoardTable(boards) {
  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = "";

  boards.forEach((board) => {
    const row = document.createElement("tr");
    row.className = "pt-4 pb-4 gap-10 hover:bg-gray-100";
    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-900">${board.title}</td>
      <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">${board.author.nickname}</td>
      <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">${new Date(board.createdAt).toLocaleDateString()}</td>
      <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">${board.views}</td>
    `;
    row.addEventListener("click", () => {
      location.href = `/board/${board.id}`;
    });
    tableBody.appendChild(row);
  });
}

function updatePagination(totalPages) {
  const paginationContainer = document.querySelector(".flex.gap-2");
  paginationContainer.innerHTML = "";

  // 이전 페이지 버튼
  const prevButton = createPaginationButton("&lt;", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchBoardList();
    }
  });
  paginationContainer.appendChild(prevButton);

  // 페이지 번호 버튼
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = createPaginationButton(
      i.toString(),
      () => {
        currentPage = i;
        fetchBoardList();
      },
      i === currentPage
    );
    paginationContainer.appendChild(pageButton);
  }

  // 다음 페이지 버튼
  const nextButton = createPaginationButton("&gt;", () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchBoardList();
    }
  });
  paginationContainer.appendChild(nextButton);
}

function createPaginationButton(text, onClick, isActive = false) {
  const button = document.createElement("button");
  button.innerHTML = text;
  button.className = `px-3 py-2 rounded-lg ${isActive ? "text-[#4362d0] bg-gray-200" : "text-[#879298] hover:bg-gray-200"}`;
  button.addEventListener("click", onClick);
  return button;
}

function setupWriteButton() {
  const writeButton = document.querySelector(
    "button[onclick=\"location.href='/write.html'\"]"
  );
  writeButton.addEventListener("click", (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (token) {
      location.href = "/write.html";
    } else {
      alert("글을 작성하려면 로그인이 필요합니다.");
      location.href = "/login.html";
    }
  });
}

function setupLogoutButton() {
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("token");
      location.href = "/index.html";
    });
  }
}
