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

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}. ${month}. ${day}`;
}

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
      setupLogoutButton();
    })
    .catch((err) => {
      console.error(err);
    });

  // 멤버 목록 가져오기
  fetch("/user/list", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((users) => {
      const tbody = document.querySelector("tbody");
      tbody.innerHTML = ""; // 기존 내용 초기화

      users.forEach((user) => {
        const row = `
          <tr class="pt-4 pb-4 gap-10 hover:bg-gray-100">
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
              ${user.nickname}
            </td>
            <td class="px-6 py-4 text-center whitespace-nowrap text-left text-sm font-medium text-gray-900">
              ${user.email}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
              ${formatDate(user.createdAt)}
            </td>
          </tr>
        `;
        tbody.innerHTML += row;
      });

      // 멤버 수 업데이트
      const memberCountElement = document.getElementById("memberCount");
      if (memberCountElement) {
        memberCountElement.textContent = users.length;
      }
    })
    .catch((error) => {
      console.error("멤버 목록을 가져오는 중 오류 발생:", error);
    });
});

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
