const { successRes, errorRes } = require("../../middlewares/response.middleware")
const axios = require('axios');
const { ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
let file = "whatsapp.controller";
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

exports.sendWhatsapp = async (req, res) => {
    try 
    {
        console.log(req.body);
        let phone = req.body.phone;
        let module = req.body.module;
        let date = req.body.date;
        let filename = req.body.fileName;
        let msg = "Find attached the GO related to your "+module+" published on "+date;
        let msg2 = " - Public Department";
        let msgg = msg.concat("%0A%0A", msg2);
        const pdfFilePath = path.join(__dirname, '../../../uploads/', filename);
        //let filePath = process.env.goFolderPath+"uploads/"+filename; 
        //sample filename in server 1714211541186.pdf
        filename = '1714211541186.pdf';
        let filePath = process.env.goFolderPath+"uploads/"+filename; 
        console.log('filePath ', filePath);
        const smsUrl = "https://int.chatway.in/api/send-file?username="+process.env.chatwayUsername+"&number="+phone+"&message="+msgg+"&token="+process.env.chatwayToken+"&file_url="+filePath;
        console.log('smsUrl ', smsUrl);
        await axios.post(smsUrl)
            .then((response) => {

                if(response.data.status && response.data.status == 'error')
                {
                    console.log("Error => ", response.data.message);
                    throw 'Error on sending whatsapp message';
                }
                else{
                    console.log('RES =>', response.data);
                    return 'Success';
                }
            }, 
            (error) => {
                console.log("Error => ", error);
                throw 'Error on sending whatsapp message';
            });
    } 
    catch (error) {
        console.log('error => ', error);
        const message = error.message ? error.message : ERRORS.SENT;
        return 'Failure';
    }
}