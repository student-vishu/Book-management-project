import axios from 'axios';

export const getApiData = (url, getData) => {
    if (url) {
        return new Promise((resolve, reject) => {
            axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                },
                ...getData
            })
                .then((response) => {
                    resolve(response.data); // Resolve with data on success
                })
                .catch((error) => {
                    reject(error); // Reject with error on failure
                });
        });
    }
};


export const postApiImageData = (url, formData, config = {}) => {
    // console.log("url", url)
    // console.log("bodyData", formData)
    // console.log("config", config)
    if (url) {
        return new Promise((resolve, reject) => {
            axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                ...config
            })
                .then((response) => {
                    resolve(response.data); // Resolve with data on success
                })
                .catch((error) => {
                    reject(error); // Reject with error on failure
                });
        });
    }
};

export const postApiData = (url, formData, config = {}) => {
    // console.log("url", url)
    // console.log("bodyData", formData)
    // console.log("config", config)
    if (url) {
        return new Promise((resolve, reject) => {
            axios.post(url, formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
                ...config
            })
                .then((response) => {
                    resolve(response.data); // Resolve with data on success
                })
                .catch((error) => {
                    reject(error); // Reject with error on failure
                });
        });
    }
};



export const deleteApiData = (url, getData) => {
    return new Promise((resolve, reject) => {
        axios.delete(url, {
            headers: {
                "Content-Type": "application/json"
            },
            ...getData
        })
            .then((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}


export const putApiUserProfileUpdate = (url, bodyData, config = {}) => {
    // console.log("url", url)
    // console.log("bodyData", bodyData)
    // console.log("config", config)
    if (url) {
        return new Promise((resolve, reject) => {
            axios.put(url, bodyData, {
                headers: {
                    "Content-Type": "application/json"
                },
                ...config
            }
            )
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    reject(error)
                })
        })
    }
}

export const putApiData = (url, formData, config = {}) => {
    // console.log("url", url)
    // console.log("bodyData", formData)
    // console.log("config", config)
    if (url) {
        return new Promise((resolve, reject) => {
            axios.put(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                ...config
            })
                .then((response) => {
                    resolve(response.data); // Resolve with data on success
                })
                .catch((error) => {
                    reject(error); // Reject with error on failure
                });
        });
    }
};