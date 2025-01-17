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
  const urlParams = new URLSearchParams(window.location.search);
  const tokenQuery = urlParams.get("token");

  if (tokenQuery) {
    localStorage.setItem("token", tokenQuery);
    urlParams.delete("token");
    const newUrl =
      window.location.pathname +
      (urlParams.toString() ? "?" + urlParams.toString() : "");
    window.history.replaceState({}, document.title, newUrl);
  }

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
        setupLogoutButton();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  fetchBoardList();
  setupWriteButton();
});

async function fetchBoardList() {
  try {
    const response = await fetch(
      `/board?page=${currentPage}&limit=${itemsPerPage}`
    );
    if (!response.ok) {
      throw new Error("서버 응답이 실패했습니다.");
    }
    const data = await response.json();

    if (!data || !Array.isArray(data.boards)) {
      throw new Error("유효하지 않은 데이터 형식입니다.");
    }

    if (data.boards.length === 0 && currentPage > 1) {
      currentPage = 1;
      fetchBoardList();
      return;
    }

    updateBoardTable(data.boards);
    updatePagination(data.totalPages);
    updateTotalPostCount(data.total);
  } catch (error) {
    console.error("게시글 목록을 가져오는 데 실패했습니다:", error);
    updateBoardTable([]);
    updatePagination(1);
    updateTotalPostCount(0);
  }
}

function updateBoardTable(boards) {
  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = "";

  if (boards.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
        게시글이 없습니다.
      </td>
    `;
    tableBody.appendChild(emptyRow);
    return;
  }

  boards.forEach((board) => {
    const row = document.createElement("tr");
    row.className = "pt-4 pb-4 gap-10 hover:bg-gray-100";
    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-900">${board.title}</td>
      <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">${board.author.nickname}</td>
      <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">${new Date(board.createdAt).toLocaleDateString()}</td>
      <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">${board.viewCount || 0}</td>
    `;
    row.addEventListener("click", () => {
      location.href = `/board.html?id=${board.id}`;
    });
    tableBody.appendChild(row);
  });
}

function updatePagination(totalPages) {
  const paginationContainer = document.getElementById("paginationContainer");
  if (!paginationContainer) return;

  paginationContainer.innerHTML = "";

  const prevButton = createPaginationButton("&lt;", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchBoardList();
    }
  });
  paginationContainer.appendChild(prevButton);

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
  button.className = `px-3 py-2 rounded-lg ${
    isActive ? "text-[#4362d0] bg-gray-200" : "text-[#879298] hover:bg-gray-200"
  }`;
  button.addEventListener("click", onClick);
  return button;
}

function updateTotalPostCount(total) {
  const totalPostCountElement = document.getElementById("totalPostCount");
  if (totalPostCountElement) {
    totalPostCountElement.textContent = total;
  }
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
