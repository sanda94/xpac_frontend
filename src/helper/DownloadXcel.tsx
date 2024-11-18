// ---------- Imports ----------
import axios from "axios";

// ---------- Interface ----------
interface DownloadExcelFunctionPropps {
    data:any;
    type:string;
    baseUrl:string
}


// ---------- Function to Download Excel ----------
const DownloadExcel= async({data , type , baseUrl}: DownloadExcelFunctionPropps) => {
    const savedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    const Token = savedUserData.accessToken;
    const UserType = savedUserData.userType;
    try {
       const response = await axios.post(`${baseUrl}/excel/${type}`, data, {
        headers:{
            token: `Bearer ${Token}`,
            usertype: UserType
        }
       });
       console.log(response);
       if(response.data.status){
        window.open(
            `http://localhost:3300/downloads/${type}.xlsx`,"_blank"
        )
       }
    } catch (error) {
        console.error("Error fetching data:", error);  
    }
}

export default DownloadExcel