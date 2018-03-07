var message = {
    error: {
        token: {
            not_provided: "Token must not be empty"
        },
        login: {
            login_validation: "Email or password is not there"
        },
        uploadfile: {
            no_file: "No file name provided",
            no_token: "File not uploaded to pcloud.No access token prodived"
        },
        folder: {
            name_empty: "Folder name can not be empty",
            id_empty: "Folder Id can not be empty"
        }
    }
}
module.exports = message;