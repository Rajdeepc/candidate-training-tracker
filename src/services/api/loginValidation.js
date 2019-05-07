import axios from 'axios';

export default {

    /**
     * axios call to post signup data
     */
    addtosignupDb(email,username, password,confpassword) {
        const body = {
            email:email,
            username: username,
            password: password,
            confpassword: confpassword
        };
        const url = "http://localhost:3000/signup";
        return axios.post(url, body)
            .then(response => {
                return response.data;
            })
    },
    /**
     * axios call to validate sign in creds
     */
    validateSignIn(email, password) {
        const body = {
            email:email,
            password: password
        };
        const url = "http://localhost:3000/signin";
        return axios.post(url, body)
            .then(response => {
                return response.data;
            })
    },
    /** Save status to db */

    statusSaveApi(member_email,taskiD,statusID,statusDesc,percentage_completion,date_updated) {
        const body = {
            member_email:member_email,
            taskiD: taskiD,
            statusID:statusID,
            statusDesc:statusDesc,
            percentage_completion:percentage_completion,
            date_updated:date_updated

        };
        const url = "http://localhost:3000/addStatus";
        return axios.put(url, body)
            .then(response => {
                return response.data;
            })
    },
    /** Add Project to db by admin */

    projectsaveApi(project_name, member_email, manager_name, allTasks) {
        const body = {
            project_name: project_name,
            member_email: member_email,
            manager_name: manager_name,
            allTasks: allTasks
        };
        const url = "http://localhost:3000/postprojectdata";
        return axios.post(url, body)
            .then(response => {
                return response.data;
            })
    },

    projectDetailsApi(username) {
        console.log(username);
        const url = `http://localhost:3000/getprojectdata/${username}`;
        return axios.get(url)
            .then(response => {
              //  console.log(response);
                return response;
            })
    },

    /** get status by date on load**/
    getStatusbyEmail(member_email) {
        const url = `http://localhost:3000/getallData/${member_email}`;
        return axios.get(url)
            .then(response => {
                return response;
            })
    },

    getAllTasks() {
        const url = "http://localhost:3000/getallData/";
        return axios.get(url)
            .then(response => {
                return response;
            })
    },

    /** update fields */

    updateStatusById(_id, description, percentage_completion, completed_date) {
        const url = `http://localhost:3000/${_id}/updatestatus`;
        const body = {
            _id: _id,
            description: description,
            percentage_completion: percentage_completion,
            completed_date: completed_date
        }
        return axios.put(url, body)
            .then(response => {
                return response.data;
            })
    },

    /**
     * delete status
     */

    deleteStatusById(_id) {
        console.log("StatusId" + _id);
        const url = `http://localhost:3000/${_id}/deleterecord`;
        return axios.delete(url)
            .then(response => {
                return response;
            })
    },
    sendStatusMail(to, htmlbody) {
        const body = {
            to: to,
            htmlbody: htmlbody
        };
        const url = "http://localhost:3000/sendemail";
        return axios.post(url, body)
            .then(response => {
                return response.data;
            })
    },

    getAllStatusByDateCreated(date_created) {
        const body = {
            date_created:date_created
        };
        const url = "http://localhost:3000/getallStatusbyDate";
        return axios.post(url,body)
        .then(response => {
            return response.data;
        })
    },


    updateStartTaskById(member_email,taskID,task_status,start_date,index) {
        const body = {
            member_email:member_email,
            taskID:taskID,
            task_status:task_status,
            start_date:start_date,
            index:index
        };
        const url = `http://localhost:3000/${taskID}/taskStartStatus`;
        return axios.put(url,body)
        .then(response => {
            return response.data;
        })
    },

    updateEndTaskById(member_email,taskID,task_status,end_date,index) {
        const body = {
            member_email:member_email,
            taskID:taskID,
            task_status:task_status,
            end_date:end_date,
            index:index
        };
        const url = `http://localhost:3000/${taskID}/taskEndStatus`;
        return axios.put(url,body)
        .then(response => {
            return response.data;
        })
    }
}

