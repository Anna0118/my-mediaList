const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";

const friends = [];
let filteredFriends = [];

const cardContainer = document.querySelector("#user-container");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");

//渲染畫面
function renderFriendList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    // title, image, id
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2 p-3">
          <div class="card">
            <img class="card-img-top" src="${item.avatar}" alt="Card image cap" data-modal-user-id="${item.id}">
          <div class="card-body">
          <h5 class="card-title">${item.name} ${item.surname}</h5>
        </div>
        <div class="card-footer">
                  <button 
            class="btn btn-primary btn-show-friend"
            data-bs-toggle="modal"
            data-bs-target="#friend-modal" 
            data-id="${item.id}"
            >More
            </button>
          <button class="btn btn-danger btn-add-favorite" data-id="${item.id}"><i class="fa-solid fa-heart"></i></button>
        </div>
      </div>
    </div>
  </div>`;
  });
  cardContainer.innerHTML = rawHTML;
}

// send request to index api
axios
  .get(INDEX_URL)
  .then((response) => {
    friends.push(...response.data.results);
    // renderFriendList(friends);
    renderPaginator(friends.length); //新增這裡
    renderFriendList(getFriendsByPage(1)); //修改這裡
  })
  .catch((error) => console.log(error));

// modal popup window
function showMoreUserInfo(id) {
  // const id = event.target.dataset.id;
  if (!id) {
    return;
  }

  const modalTitleBox = document.querySelector(".modal-title");
  const modalAvatarBox = document.querySelector(".modal-avatar");
  const modalUserInfoBox = document.querySelector(".modal-user-info");

  // 先將 modal 內容清空，以免出現上一個 user 的資料殘影
  modalTitleBox.textContent = "";
  modalAvatarBox.src = "";
  modalUserInfoBox.textContent = "";

  // get personal information api
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const user = response.data;
      modalTitleBox.textContent = user.name + " " + user.surname;
      modalAvatarBox.src = user.avatar;
      modalUserInfoBox.innerHTML = `
      <p>email: ${user.email}</p>
      <p>gender: ${user.gender}</p>
      <p>age: ${user.age}</p>
      <p>region: ${user.region}</p>
      <p>birthday: ${user.birthday}</p>`;
    })
    .catch((error) => console.log(error));
}

// listen to card
cardContainer.addEventListener("click", (event) => {
  const id = Number(event.target.dataset.id);
  if (event.target.matches(".btn-show-friend")) {
    showMoreUserInfo(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    // 再Class增加屬性，來優化使用者經驗
    if (event.target.classList.contains("liked")) {
      removeFromFavorite(id);
      event.target.classList.remove("liked");
    } else {
      addToFavorite(id);
      event.target.classList.add("liked");
    }
  }
});

//功能一: 搜尋朋友
searchForm.addEventListener("submit", (event) => {
  //避免頁面重新跳轉
  event.preventDefault();
  // trim()：把字串頭尾空格去掉。若使用者不小心輸入一堆空白送出，會被視為沒有輸入東西
  const keyword = searchInput.value.trim().toLowerCase();

  //條件篩選
  filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(keyword) ||
      friend.surname.toLowerCase().includes(keyword)
  );

  if (!filteredFriends.length) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  renderFriendList(filteredFriends);

  // 重製分頁器
  renderPaginator(filteredFriends.length);
  // 預設顯示第 1 頁的搜尋結果
  renderFriendList(getFriendsByPage(1));
});

//功能二: 收藏
function addToFavorite(id) {
  // 第一次使用收藏功能時，此時 local storage 是空的，有東西後就會拿到
  const list = JSON.parse(localStorage.getItem("favoriteFriends")) || [];
  // 請 find 去總清單查看，找出 id 相同的電影物件回傳，暫存在 friend
  const friend = friends.find((friend) => friend.id === id);
  // 使用array.some()來查看
  if (list.some((friend) => friend.id === id)) {
    return alert("這位朋友已經被你收藏了喔！");
  }
  list.push(friend);
  localStorage.setItem("favoriteFriends", JSON.stringify(list));
}

// 功能二: 刪除
function removeFromFavorite(id) {
  if (!friends || !friends.length) return;
  //透過 id 找到要刪除電影的 index
  const friendIndex = friends.findIndex((friend) => friend.id === id);
  if (friendIndex === -1) return;
  //刪除該筆電影
  friends.splice(friendIndex, 1);
  //存回 local storage
  localStorage.setItem("favoriteFriends", JSON.stringify(friends));
  //更新頁面 (要放在函式內，才能即時做更新)
  renderFriendList(friends);
}

//功能三: 分頁
const FRIENDS_PER_PAGE = 12;

//佈局分頁內清單數量
function getFriendsByPage(page) {
  //三元運算子
  const data = filteredFriends.length ? filteredFriends : friends;
  //計算起始 index
  const startIndex = (page - 1) * FRIENDS_PER_PAGE;
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + FRIENDS_PER_PAGE);
}

//渲染分頁
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / FRIENDS_PER_PAGE);
  //製作 template
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  //放回 HTML
  paginator.innerHTML = rawHTML;
}

paginator.addEventListener("click", (event) => {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== "A") return;

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page);
  //更新畫面
  renderFriendList(getFriendsByPage(page));
});
