class ApiResponse{
    constructor(statusCode,  data,message ="scuccess"){
        this.success = statusCode<400;
        this.message = message;
        this.data = data;
        this.statusCode = statusCode;
    }
}
export default ApiResponse;