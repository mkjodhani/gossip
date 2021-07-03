async function Authenticate(req,res,next)
{
    console.log("----------------------------------------------------------------------------------------------");
    console.log();
    console.log("----------------------------------------------------------------------------------------------");
    if(req.session.username)
    {
        console.log("Authorized..."+req.session.username);
        next();
    }
    else
    {
        res.redirect('login.html');
        console.log("Not authorized...");
    }
} 
module.exports = Authenticate