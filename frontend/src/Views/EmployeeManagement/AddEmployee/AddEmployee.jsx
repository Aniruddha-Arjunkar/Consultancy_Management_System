import { useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import employeesService from "../../../services/employeesService";

const createInitialForm = (user) => ({
    title: "Mr.",
    custName: "",
    custPhone: "",
    dob: "",
    gender: "Male",
    custEmail: "",
    alternatePhoneRelation: "",
    custAlternate: "",
    motherName: "",
    custAddress1: "",
    custAddress2: "",
    maritalStatus: "Single",
    spouseName: "",
    spouseOccupation: "",
    education10th: "",
    education12th: "",
    educationGraduation: "",
    educationPostgrad: "",
    experienceFresher: "Fresher",
    previousExperience: "",
    workExperienceYears: "",
    previousCompanyName: "",
    previousDesignation: "",
    previousJobSalary: "",
    employeeType: "",
    department: "",
    packageName: "",
    joiningDate: "",
    designation: "",
    branch:
        user?.branch && user.branch.toUpperCase() !== "ALL"
            ? user.branch
            : "",
    accountNo: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
    adharNo: "",
    panCardNo: "",
    pfUan: "",
    pfNumber: "",
    esicNumber: "",
});

function AddEmployee() {
    const { user } = useAuth();
    const formElement = useRef(null);

    const [form, setForm] = useState(() => createInitialForm(user));
    const [photo, setPhoto] = useState(null);
    const [saving, setSaving] = useState(false);

    const role = user?.role?.trim().toUpperCase();
    const userBranch = user?.branch?.trim();
    const canChooseBranch =
        role === "SUPER_ADMIN" || userBranch?.toUpperCase() === "ALL";

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const inputField = ({
        id,
        name,
        label,
        placeholder,
        type = "text",
        required = false,
        maxLength,
    }) => (
        <div className="form-group" key={id}>
            <label htmlFor={id}>
                {label}
                {id === "cust_name" && <span>*</span>}
            </label>
            <input
                type={type}
                id={id}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                required={required}
                maxLength={maxLength}
            />
        </div>
    );

    const selectField = ({
        id,
        name,
        label,
        options,
        required = false,
        disabled = false,
    }) => (
        <div className="form-group" key={id}>
            <label htmlFor={id}>{label}</label>
            <select
                id={id}
                name={name}
                value={form[name]}
                onChange={handleChange}
                required={required}
                disabled={disabled}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.branch) {
            window.alert("Select Branch.");
            return;
        }

        setSaving(true);

        try {
            const formData = new FormData();

            Object.entries(form).forEach(([name, value]) => {
                formData.append(name, value ?? "");
            });

            if (photo) {
                formData.append("photo", photo);
            }

            const result =
                await employeesService.createEmployee(formData);

            window.alert("Employee added successfully ✅.");

            setForm(createInitialForm(user));
            setPhoto(null);
            formElement.current?.reset();
        } catch (error) {
            window.alert(error.message || "Unable to add employee ❌.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="add-employee-page">
            <section id="main-content">
                <section className="">
                    <div className="reg-w3">
                        <div className="refollowup-card">
                            <div className="refollowup-header">
                                <div className="refollowup-title">
                                    <span className="phone-icon">👤</span>
                                    <div>
                                        <h2>Add Employee</h2>
                                        <p>Add employee details</p>
                                    </div>
                                </div>
                            </div>

                            <form
                                ref={formElement}
                                className="refollowup-form"
                                onSubmit={handleSubmit}
                                encType="multipart/form-data"
                            >
                                <h3>Personal Details</h3>

                                <div className="form-row">
                                    {selectField({
                                        id: "title",
                                        name: "title",
                                        label: "Title",
                                        required: true,
                                        options: [
                                            { value: "Mr.", label: "Mr." },
                                            { value: "Ms.", label: "Ms." },
                                            { value: "Mrs.", label: "Mrs." },
                                        ],
                                    })}

                                    {inputField({
                                        id: "cust_name",
                                        name: "custName",
                                        label: "Name ",
                                        placeholder: "Enter employee's name",
                                        required: true,
                                    })}

                                    {inputField({
                                        id: "cust_phone",
                                        name: "custPhone",
                                        label: "Phone",
                                        placeholder: "Enter phone number",
                                        maxLength: 10,
                                    })}

                                    {inputField({
                                        id: "dob",
                                        name: "dob",
                                        label: "Date of Birth",
                                        type: "date",
                                    })}

                                    {selectField({
                                        id: "gender",
                                        name: "gender",
                                        label: "Gender",
                                        required: true,
                                        options: [
                                            { value: "Male", label: "Male" },
                                            { value: "Female", label: "Female" },
                                            { value: "Other", label: "Other" },
                                        ],
                                    })}

                                    {inputField({
                                        id: "cust_email",
                                        name: "custEmail",
                                        label: "Email",
                                        placeholder: "Enter email address",
                                        type: "email",
                                    })}

                                    {selectField({
                                        id: "alternate_phone_relation",
                                        name: "alternatePhoneRelation",
                                        label: "Relationship",
                                        options: [
                                            { value: "", label: "Select Relation" },
                                            { value: "Father", label: "Father" },
                                            { value: "Mother", label: "Mother" },
                                            { value: "Spouse", label: "Spouse" },
                                            { value: "Brother", label: "Brother" },
                                            { value: "Sister", label: "Sister" },
                                            { value: "Friend", label: "Friend" },
                                            { value: "Other", label: "Other" },
                                        ],
                                    })}

                                    {inputField({
                                        id: "cust_alternate",
                                        name: "custAlternate",
                                        label: "Alternate Phone",
                                        placeholder: "Enter alternate phone number",
                                        maxLength: 10,
                                    })}

                                    {inputField({
                                        id: "mother_name",
                                        name: "motherName",
                                        label: "Mother's Name",
                                        placeholder: "Enter mother's name",
                                    })}
                                </div>

                                <div className="form-row">
                                    {inputField({
                                        id: "cust_address1",
                                        name: "custAddress1",
                                        label: "Current Address",
                                        placeholder: "Enter current address",
                                    })}

                                    {inputField({
                                        id: "cust_address2",
                                        name: "custAddress2",
                                        label: "Permanent Address",
                                        placeholder: "Enter permanent address",
                                    })}
                                </div>

                                <div className="form-row">
                                    {selectField({
                                        id: "marital_status",
                                        name: "maritalStatus",
                                        label: "Marital Status",
                                        options: [
                                            { value: "Single", label: "Single" },
                                            { value: "Married", label: "Married" },
                                            { value: "Unmarried", label: "Unmarried" },
                                        ],
                                    })}
                                </div>

                                <div
                                    className="form-row"
                                    id="spouse_details"
                                    style={{
                                        display:
                                            form.maritalStatus === "Married"
                                                ? "flex"
                                                : "none",
                                    }}
                                >
                                    {inputField({
                                        id: "spouse_name",
                                        name: "spouseName",
                                        label: "Spouse Name",
                                        placeholder: "Enter spouse's name",
                                    })}

                                    {inputField({
                                        id: "spouse_occupation",
                                        name: "spouseOccupation",
                                        label: "Spouse Occupation",
                                        placeholder: "Enter spouse's occupation",
                                    })}
                                </div>

                                <h3>Education Details</h3>
                                <div className="form-row">
                                    {inputField({
                                        id: "education_10th",
                                        name: "education10th",
                                        label: "10th",
                                        placeholder: "Enter 10th qualification",
                                    })}

                                    {inputField({
                                        id: "education_12th",
                                        name: "education12th",
                                        label: "12th",
                                        placeholder: "Enter 12th qualification",
                                    })}

                                    {inputField({
                                        id: "education_graduation",
                                        name: "educationGraduation",
                                        label: "Graduation",
                                        placeholder: "Enter graduation qualification",
                                    })}

                                    {inputField({
                                        id: "education_postgrad",
                                        name: "educationPostgrad",
                                        label: "Post Graduation",
                                        placeholder: "Enter post graduation qualification",
                                    })}
                                </div>

                                <h3>Experience / Fresher Details</h3>
                                <div className="form-row">
                                    {selectField({
                                        id: "experience_fresher",
                                        name: "experienceFresher",
                                        label: "Experience / Fresher",
                                        options: [
                                            { value: "Experience", label: "Experience" },
                                            { value: "Fresher", label: "Fresher" },
                                        ],
                                    })}

                                    {inputField({
                                        id: "previous_experience",
                                        name: "previousExperience",
                                        label: "Previous Experience",
                                        placeholder: "Enter previous experience",
                                    })}

                                    {inputField({
                                        id: "work_experience_years",
                                        name: "workExperienceYears",
                                        label: "Work Experience (Years)",
                                        placeholder: "Enter work experience years",
                                    })}

                                    {inputField({
                                        id: "previous_company_name",
                                        name: "previousCompanyName",
                                        label: "Previous Company Name",
                                        placeholder: "Enter previous company name",
                                    })}

                                    {inputField({
                                        id: "previous_designation",
                                        name: "previousDesignation",
                                        label: "Previous Designation",
                                        placeholder: "Enter previous designation",
                                    })}

                                    {inputField({
                                        id: "previous_job_salary",
                                        name: "previousJobSalary",
                                        label: "Previous Job Salary (Annual)",
                                        placeholder: "Enter previous job salary",
                                    })}
                                </div>

                                <h3>Employee Details</h3>
                                <div className="form-row">
                                    {selectField({
                                        id: "employee_type",
                                        name: "employeeType",
                                        label: "Employee Type",
                                        options: [
                                            { value: "", label: "Select Type" },
                                            { value: "Full Time", label: "Full Time" },
                                            { value: "Part Time", label: "Part Time" },
                                            { value: "Intern", label: "Intern" },
                                            { value: "Daily Based", label: "Daily Based" },
                                            { value: "Per Day", label: "Per Day" },
                                        ],
                                    })}

                                    {selectField({
                                        id: "department",
                                        name: "department",
                                        label: "Department",
                                        options: [
                                            { value: "", label: "Select Department" },
                                            { value: "IT", label: "IT" },
                                            { value: "HR", label: "HR" },
                                            { value: "Trainer", label: "Trainer" },
                                            { value: "Sales", label: "Sales" },
                                            { value: "Pest Control", label: "Pest Control" },
                                            { value: "Business Developer", label: "Business Developer" },
                                        ],
                                    })}

                                    {inputField({
                                        id: "package",
                                        name: "packageName",
                                        label: "Package",
                                        placeholder: "Enter package",
                                    })}

                                    {inputField({
                                        id: "date",
                                        name: "joiningDate",
                                        label: "Joining Date",
                                        type: "date",
                                    })}

                                    {inputField({
                                        id: "designation",
                                        name: "designation",
                                        label: "Designation",
                                        placeholder: "Enter designation",
                                    })}

                                    {selectField({
                                        id: "branch",
                                        name: "branch",
                                        label: "Branch",
                                        disabled: !canChooseBranch,
                                        options: [
                                            { value: "", label: "Select Branch" },
                                            { value: "Nagpur", label: "Nagpur" },
                                            { value: "Bramhapuri", label: "Bramhapuri" },
                                            { value: "Chandrapur", label: "Chandrapur" },
                                        ],
                                    })}
                                </div>

                                <h3>Bank Details</h3>
                                <div className="form-row">
                                    {inputField({
                                        id: "account_no",
                                        name: "accountNo",
                                        label: "Account No.",
                                        placeholder: "Enter Account No.",
                                    })}

                                    {inputField({
                                        id: "bank_name",
                                        name: "bankName",
                                        label: "Bank Name",
                                        placeholder: "Enter bank name",
                                    })}

                                    {inputField({
                                        id: "branch_name",
                                        name: "branchName",
                                        label: "Branch Name",
                                        placeholder: "Enter branch name",
                                    })}

                                    {inputField({
                                        id: "ifsc_code",
                                        name: "ifscCode",
                                        label: "IFSC Code",
                                        placeholder: "Enter IFSC code",
                                    })}
                                </div>

                                <h3>KYC Details</h3>
                                <div className="form-row">
                                    {inputField({
                                        id: "adhar_no",
                                        name: "adharNo",
                                        label: "Aadhar No",
                                        placeholder: "Enter Aadhar Number",
                                    })}

                                    {inputField({
                                        id: "pan_card_no",
                                        name: "panCardNo",
                                        label: "PAN Card No",
                                        placeholder: "Enter PAN Card Number",
                                    })}
                                </div>

                                <h3>Profile Photo</h3>
                                <div className="form-group">
                                    <label htmlFor="photo">Upload Photo</label>
                                    <input
                                        type="file"
                                        id="photo"
                                        name="photo"
                                        onChange={(event) =>
                                            setPhoto(
                                                event.target.files?.[0] || null
                                            )
                                        }
                                    />
                                </div>

                                <h3>Provident Fund and ESIC Details</h3>
                                <div className="form-row">
                                    {inputField({
                                        id: "uan_no",
                                        name: "pfUan",
                                        label: "UAN No",
                                        placeholder: "Enter UAN Number",
                                    })}

                                    {inputField({
                                        id: "pf_no",
                                        name: "pfNumber",
                                        label: "PF No",
                                        placeholder: "Enter PF Number",
                                    })}

                                    {inputField({
                                        id: "esic_no",
                                        name: "esicNumber",
                                        label: "ESIC No",
                                        placeholder: "Enter ESIC Number",
                                    })}
                                </div>

                                <button
                                    type="submit"
                                    name="submit"
                                    className="submit-btn"
                                    disabled={saving}
                                >
                                    <span>👤</span>
                                    {saving ? "Saving..." : "Submit"}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </section>
        </div>
    );
}
export default AddEmployee;