import { Link } from "react-router-dom";


function Account(){

  return(

    <div>

      <h1>
        My Account
      </h1>


      <p>
        Welcome! Find and book services you need.
      </p>


      <Link to="/services">

        <button>
          Browse Services
        </button>

      </Link>


    </div>

  );

}


export default Account;