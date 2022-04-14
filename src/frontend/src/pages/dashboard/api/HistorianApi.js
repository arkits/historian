import axiosInstance from "../../../utils/axios"


function deleteHistory(historyId, authHeader) {
    axiosInstance({
        method: 'delete',
        url: "/history/" + historyId,
        headers: {
            Authorization: authHeader
        }
    })
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
    return
}

export {
    deleteHistory
}