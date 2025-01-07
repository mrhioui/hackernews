let maxId;
let max;

const GetMaxid = async () => {
  try {
    maxId = await fetch("https://hacker-news.firebaseio.com/v0/maxitem.json").then(res => res.json());
    return maxId;
  } catch (err) {
    console.error("Error fetching maxId:", err);
  }
}

const fetchData = async (proprity) => {
  const url = `https://hacker-news.firebaseio.com/v0/item/${proprity}.json`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch data for ID: ${proprity}`);
    const data = await response.json();
    if (!data) throw new Error(`No data returned for ID: ${proprity}`);
    return data;
  } catch (e) {
    console.error("Error fetching data:", e);
    return null;
  }
}

const getPosts = async (start, end) => {
  let Posts = [];

  for (let i = start; i >= end && i > 0; i--) {
    const post = fetchData(i);
    if (post && post.type !== "comment") {
      Posts.push(post);
    }
  }
  return Promise.all(Posts);
}

const GetComments = async (id) => {
  let post = await fetchData(id);
  let comments = [];

  if (post && post.kids) {
    for (let element of post.kids) {
      let comment = fetchData(element);
      if (comment) comments.push(comment);
    }
  }
  return Promise.all(comments);
};

const desplayPosts = async (valid = false) => {
  if (!valid) {
    maxId = await GetMaxid();
    max = maxId;
  } else {
    maxId -= 100;
  }

  const start = maxId;
  const end = start - 100;
  const Posts = (await getPosts(start, end)).filter(post => post && post.type !== 'comment');
  const content = document.getElementById("stories");

  if (!content) return;

  Posts.forEach(post => {
    const div = document.createElement("div");
    div.classList.add("post");
    div.innerHTML = `
      <h3><a href="${post.url || "#"}" target="_blank">${post.title || "No Title"}</a></h3>
      <h6>${post.score || 0} points | type : ${post.type}</h6>
      <p>Posted by ${post.by} | ${new Date(post.time * 1000).toLocaleString()} |</p>
      ${post.kids >0?`<span class="click" onclick="DesplayComments(${post.id})">${post.kids ? post.kids.length : 0} comments</span>`:`<span class="click">${post.kids ? post.kids.length : 0} comments</span>`}
    `;
    content.appendChild(div);
  });
  const elements = document.getElementsByClassName("click");

  elements.forEach(element => {
    element.style.cursor = "pointer";
  });
};

const DesplayComments = async (id) => {
  const divs = document.querySelectorAll(".section");
  divs.forEach(div => div.classList.remove("active"));
  const divcoment = document.getElementById("comments");
  divcoment.classList.add("active");
  const post = await fetchData(id);
  const comments = await GetComments(id);

  if (!post || !divcoment) return;

  divcoment.innerHTML = `
    <div class="post">
      <h3><a href="${post.url || "#"}" target="_blank">${post.title || "No Title"}</a></h3>
      <h6>${post.score || 0} points | type : ${post.type}</h6>
      <p>Posted by ${post.by} | ${new Date(post.time * 1000).toLocaleString()}</p>
    </div>
  `;

  comments.forEach(comment => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h6>${comment.score || 0} points | type : ${comment.type}</h6>
      <p>Posted by ${comment.by} | ${new Date(comment.time * 1000).toLocaleString()}</p>
      <hr>
    `;
    divcoment.appendChild(div);
  });
}

let isLoading = false;

window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight && !isLoading) {
    isLoading = true;
    desplayPosts(isLoading).finally(() => {
      isLoading = false;
    });
  }
});

setInterval(async () => {
  try {
    const currentMaxPosts = await GetMaxid();
    if (currentMaxPosts > max) {
      alert("New posts have been added!");
      max = currentMaxPosts;
    }
  } catch (error) {
    console.error("Error fetching max ID:", error);
  }
}, 5000);


const gate = async () => {
  const loader = document.createElement("div");
  loader.id = "loader";
  loader.textContent = "Loading...";
  loader.style.textAlign = "center";
  document.body.appendChild(loader);
  loader.style.display = "block";
  await desplayPosts();
  loader.style.display = "none";
  document.body.removeChild(loader);
}

gate();
