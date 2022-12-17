const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";

const friends = JSON.parse(localStorage.getItem("favoriteFriends")); //收藏清單

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
          <button class="btn btn-black btn-remove-favorite" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>
  </div>`;
  });
  cardContainer.innerHTML = rawHTML;
}
renderFriendList(friends);

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
  if (event.target.matches(".btn-show-friend")) {
    showMoreUserInfo(event.target.dataset.id);
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id));
  }
});

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

// 功能三: 分頁
