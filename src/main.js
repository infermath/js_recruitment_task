import './styles/main.css';

// Please use https://open-platform.theguardian.com/documentation/

// for node version < 11.0.0:
// 🚨 Build failed.
// Error: [(...previousDevDepRequests.entries(...))].filter(...).flatMap is not a function
// TypeError: [(...previousDevDepRequests.entries(...))].filter(...).flatMap is not a function
//     at Object.run (/home/pawel/js_recruitment_task/node_modules/@parcel/core/lib/requests/AssetRequest.js:94:122)
// https://github.com/wallabyjs/quokka/issues/427

onPageLoad();

function onPageLoad() {
  getData();
  generateList();
  loadReadList();
  document
    .getElementById('activePageSelect')
    .addEventListener('change', getData);
  document
    .getElementById('sectionSelect')
    .addEventListener('change', resetPage);
  document
    .getElementById('newsContentSearch')
    .addEventListener('change', resetPage);
}

function getData() {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);
  const page = document.getElementById('activePageSelect').value;
  const section = document.getElementById('sectionSelect').value;
  const search = document.getElementById('newsContentSearch').value;
  const params = {
    page: page,
    'from-date': fromDate.toISOString().slice(0, 10),
  };
  if (section !== 'all') {
    params['section'] = section;
  }
  if (search) {
    params['q'] = search;
  }
  params['api-key'] = 'f452f444-fce3-4eab-bc8f-242960717653';
  fetch(
    'https://content.guardianapis.com/search?' + new URLSearchParams(params)
  )
    .then((response) => response.json())
    .then((data) => processData(data.response))
    .catch((error) => {
      showResults(false);
      console.log(error);
    });
}

function processData(response) {
  const data = response.results;
  const news = document.getElementsByClassName('news');
  showResults(data && data.length > 0);
  setPagesNumber(response.pages);

  for (let i = 0; i < news.length; i++) {
    if (data.length <= i) {
      news[i].style.display = 'none';
    } else {
      news[i].style.display = 'block';
      const title = news[i].getElementsByTagName('H3')[0];
      title.innerHTML = data[i].webTitle;
      const link = news[i].getElementsByTagName('A')[0];
      link.setAttribute('href', data[i].webUrl);
      const description = news[i].getElementsByTagName('SPAN');
      description[0].innerHTML = data[i].sectionName;
      const date = new Date(data[i].webPublicationDate);
      description[1].innerHTML = date.toLocaleDateString('en-GB');
      const readLater = news[i].getElementsByTagName('BUTTON')[0];
      readLater.addEventListener('click', () =>
        addToReadList({
          title: data[i].webTitle,
          url: data[i].webUrl,
        })
      );
    }
  }
}

function showResults(show) {
  document.getElementById('newsList').style.visibility = show
    ? 'visible'
    : 'hidden';
  document.getElementById('no-results').style.visibility = show
    ? 'hidden'
    : 'visible';
}

function resetPage() {
  const page = document.getElementById('activePageSelect');
  page.value = 1;
  page.dispatchEvent(new Event('change'));
}

function setPagesNumber(pages) {
  const pagesNumber = Math.min(Math.ceil(pages / 10), 10);
  const pagesOptions = document.getElementsByClassName('activePageOption');

  for (let i = 0; i < pagesOptions.length; i++) {
    pagesOptions[i].hidden = i >= pagesNumber;
  }
}

function generateList() {
  const newsList = document.getElementById('newsList');
  for (let i = 0; i < 9; i++) {
    const clone = newsList.lastElementChild.cloneNode(true);
    newsList.appendChild(clone);
  }
}

function loadReadList() {
  const storedList = JSON.parse(localStorage.getItem('storedList'));
  if (!storedList) {
    return false;
  }
  storedList.forEach(addListItem);
  document.getElementById('readLaterList').lastElementChild.style.display =
    'none';
}

function addToReadList(item) {
  const storedList = JSON.parse(localStorage.getItem('storedList'));
  if (storedList && storedList.some((i) => i.title === item.title)) {
    return false;
  }

  const toReadList = storedList ? [...storedList, item] : [item];
  localStorage.setItem('storedList', JSON.stringify(toReadList));

  addListItem(item);
}

function addListItem(item) {
  const toReadListElement = document.getElementById('readLaterList');
  const clone = toReadListElement.lastElementChild.cloneNode(true);
  clone.style.display = 'block';
  const title = clone.getElementsByTagName('H4')[0];
  title.innerHTML = item.title;
  const link = clone.getElementsByTagName('A')[0];
  link.setAttribute('href', item.url);
  const remove = clone.getElementsByTagName('BUTTON')[0];
  remove.addEventListener('click', () => {
    clone.remove();
    deleteFromReadList(item.title);
  });

  toReadListElement.prepend(clone);
}

function deleteFromReadList(title) {
  const storedList = JSON.parse(localStorage.getItem('storedList'));
  if (!storedList) {
    return false;
  }
  const filteredList = storedList.filter((item) => item.title !== title);
  localStorage.setItem('storedList', JSON.stringify(filteredList));
}
