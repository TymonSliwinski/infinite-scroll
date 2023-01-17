const IMAGES_CONTAINER = document.querySelector('#images-container')
const IMAGES_PER_ROW = 4;
const API_LINK = 'https://pixabay.com/api/';
var API_PAGE_NUMBER = 1;


// stolen 
function resizeGridItem(item) {
    grid = document.getElementsByClassName("grid")[0];
    rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
    rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
    item.style.gridRowEnd = "span " + rowSpan;
}

function resizeAllGridItems() {
    allItems = document.getElementsByClassName("item");
    for (x = 0; x < allItems.length; x++) {
        resizeGridItem(allItems[x]);
    }
}

function resizeInstance(instance) {
    item = instance.elements[0];
    resizeGridItem(item);
}
// end stolen

/**
 * @param {Array} arr 
 * @param {number} perGroup number of elements in each group
 * @returns array of arrays with given number of elements
 */
const createGroups = (arr, perGroup) => arr.map((_, i) => i % perGroup === 0 ? arr.slice(i, i + perGroup) : null).filter(Boolean);


/**
 * @param {string} queryString str calls pixaby API with given query stirng
 * @param {number} page page number
 * @returns Array with images object data
 */
const searchImages = async (queryString, page = 1) => {
    const apiKey = '32873805-5230895e17b988f3cc17057f4';
    const url = `${API_LINK}?q=${encodeURIComponent(queryString)}&key=${apiKey}&image_type=photo&page=${page}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.hits;
    } catch (error) {
        console.log(error);
        return [];
    }
};


/**
 * Inits modal with large image
 * @param {string} largeImageURL image URL
 */
const initModal = (largeImageURL) => {
    console.log('initModal')
    basicLightbox.create(`
        <img src="${largeImageURL}" width="800" height="600">
    `).show();
};


/**
 * returns HTML section with images after load
 * @param {[object]} imageDataArray array of image data from API call
 * @returns Array of HTMLImageElement
 */
const renderSection = (imageDataArray) => {
    // imageDataArray.forEach((imageData) => {
    //     const img = renderSingleImage(imageData);
    //     container.appendChild(img);
    // });

    return imageDataArray.map(renderSingleImage);
};


/**
 * returns image components HTML element
 * @param {object} imageData single image from API call
 * @returns object HTMLImageElement
 */
const renderSingleImage = (imageData) => {
    const {
        largeImageURL,
        webformatURL
    } = imageData;

    const container = document.createElement('li');
    container.classList.add(...['item'])

    const link = document.createElement('a');
    link.classList.add(...['content']);
    link.href = largeImageURL;
    link.addEventListener('click', (event) => {
        event.preventDefault();
        initModal(largeImageURL);
    });

    const img = document.createElement('img');
    img.src = webformatURL;
    img['data-source'] = largeImageURL;
    img['data-lightbox'] = largeImageURL;
    img.classList.add(...['responsive-img', 'materialboxed']);

    link.appendChild(img);
    container.appendChild(link);

    return container;
};


const attachObserver = (element) => {
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
    };

    const observer = new IntersectionObserver(([entry], observer) => {
        if (!entry.isIntersecting) {
            return;
        }
        loadImages();
        observer.disconnect();
    }, options);
    observer.observe(element, options);
};


/**
 * Load images callback for IntersectionObserver
 */
const loadImages = async () => {
    const queryString = document.querySelector('#search-input').value;
    const images = await searchImages(queryString, API_PAGE_NUMBER);
    if (!images.length) {
        return;
    }

    const imagesGroups = renderSection(images);
    imagesLoaded(IMAGES_CONTAINER, () => {
        imagesGroups.forEach((group) => {
            IMAGES_CONTAINER.appendChild(group);
        });
    });

    imagesLoaded(imagesGroups, () => {
        resizeAllGridItems();
        setTimeout(() => {
            attachObserver(imagesGroups[imagesGroups.length - 1]);
        }, 500);
    });

    API_PAGE_NUMBER += 1;
};



const init = () => {
    const submitButton = document.querySelector('#search-submit');
    submitButton.addEventListener('click', () => {
        IMAGES_CONTAINER.innerHTML = '';
        loadImages();
    });
};

window.addEventListener('load', init);
window.addEventListener("resize", resizeAllGridItems);


