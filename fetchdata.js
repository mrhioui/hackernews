let maxId;
let max;
async function GetMaxid() {
  try {
    maxId = await fetch("https://hacker-news.firebaseio.com/v0/maxitem.json").then(res => res.json());
    return maxId;
  } catch (err) {
    console.error("Error fetching maxId:", err);
  }
}
async function fetchData(proprity) {
  const url = `https://hacker-news.firebaseio.com/v0/item/${proprity}.json`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for ID: ${proprity}`);
    }
    const data = await response.json();
    if (!data) throw new Error(`No data returned for ID: ${proprity}`);
    console.log(data);

    return data;
  } catch (e) {
    console.error("Error fetching data:", e);
    return null;
  }
}


async function getPosts(star, end) {
  let Posts = [];
  maxId = await GetMaxid();

  for (let i = star; i >= end && i > 0; i--) {
    const post = fetchData(i);
    Posts.push(post);
  }
  return Promise.all(Posts);
}


const GetComments = async (id) => {
  let post = await fetchData(id);
  let comments = [];

  if (post && post.kids) {
    for (let element of post.kids) {
      let comment = await fetchData(element);
      if (comment) comments.push(comment);
    }
  }
  return comments;
};


const desplayPosts = async (valid = false) => {
  if (!valid) {
    maxId = await GetMaxid();
    max = maxId;
  } else {
    maxId -= 100;
  }

  let start = maxId;
  let end = start - 100;
  let Posts = await getPosts(start, end);
  Posts = Posts.filter(post => post && post.type !== 'comment')
  let conten = document.getElementById("stories");

  Posts.forEach(post => {
    let div = document.createElement("div");
    div.classList.add("post");
    div.innerHTML = `
      <h3><a href="${post.url || "#"}" target="_blank">${post.title || "No Title"}</a></h3>
      <h6>${post.score || 0} points | type : ${post.type}</h6>
      <p>Posted by ${post.by} | ${new Date(post.time * 1000).toLocaleString()} |</p>
      <span class="click" onclick ="DesplayComments(${post.id})"> ${post.kids ? post.kids.length : 0} comments </span>
    `;
    conten.appendChild(div);
  });
  const elements = Array.from(document.getElementsByClassName("click"));

  elements.forEach(element => {
    element.style.cursor = "pointer";
  });
};

async function DesplayComments(id) {
  let comments = await GetComments(id);
  let divs = document.querySelectorAll(".section")
  divs.forEach((div) => {
    div.classList.toggle("active")
  })
  let divcoment = document.querySelector(".active")
  let post = await fetchData(id)
  divcoment.innerHTML = `
  <div class="post">
    <h3><a href="${post.url || "#"}" target="_blank">${post.title || "No Title"}</a></h3>
    <h6>${post.score || 0} points | type : ${post.type} </h6>
    <p>Posted by ${post.by} | ${new Date(post.time * 1000).toLocaleString()} |</p> 
    </div>
  `;
  comments.forEach((comment) => {
    let div = document.createElement("div")
    div.innerHTML = `
<h3></h3>
    <h6>${comment.score || 0} points | type : ${comment.type} </h6>
    <p>Posted by ${comment.by} | ${new Date(comment.time * 1000).toLocaleString()} |</p> 
    <hr>
`
    divcoment.appendChild(div)
  })
}

let isLoading = false;

window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight && !isLoading) {
    isLoading = true;
    desplayPosts(true).finally(() => {
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


async function gate() {
  await desplayPosts()
  console.log("here")
}
gate()
