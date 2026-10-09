import logo from "../../assets/logo.png";
import "./WelcomePage.css";

function WelcomePage() {
    return (
        <section className="shul-welcome-page">
            <div className="shul-welcome-content">
                <img
                    src={logo}
                    alt="SHUL Ventures Pvt. Ltd."
                    className="shul-welcome-logo"
                />
                <h1>
                    Welcome To Shul Ventures Pvt. Ltd.
                </h1>
            </div>
        </section>
    );
}
export default WelcomePage;