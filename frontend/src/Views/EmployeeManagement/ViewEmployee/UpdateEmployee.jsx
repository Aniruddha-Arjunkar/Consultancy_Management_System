import { useEffect, useRef, useState } from "react";
import { useParams , useNavigate } from "react-router";
import { useAuth } from "../../../context/AuthContext";
import API_BASE_URL from "../../../services/api";
import employeesService from "../../../services/employeesService";

const createFormFromEmployee = (employee) => ({
    title: employee.title ?? "Mr.",
    custName: employee.custName ?? "",
    custPhone: employee.custPhone ?? "",
    dob: employee.dob ?? "",
    gender: employee.gender ?? "Male",
    custEmail: employee.custEmail ?? "",
    alternatePhoneRelation: employee.alternatePhoneRelation ?? "",
    custAlternate: employee.custAlternate ?? "",
    motherName: employee.motherName ?? "",
    custAddress1: employee.custAddress1 ?? "",
    custAddress2: employee.custAddress2 ?? "",
    maritalStatus: employee.maritalStatus ?? "Single",
    spouseName: employee.spouseName ?? "",
    spouseOccupation: employee.spouseOccupation ?? "",
    education10th: employee.education10th ?? "",
    education12th: employee.education12th ?? "",
    educationGraduation: employee.educationGraduation ?? "",
    educationPostgrad: employee.educationPostgrad ?? "",
    experienceFresher: employee.experienceFresher ?? "Fresher",
    previousExperience: employee.previousExperience ?? "",
    workExperienceYears: employee.workExperienceYears ?? "",
    previousCompanyName: employee.previousCompanyName ?? "",
    previousDesignation: employee.previousDesignation ?? "",
    previousJobSalary: employee.previousJobSalary ?? "",
    employeeType: employee.employeeType ?? "",
    department: employee.department ?? "",
    packageName: employee.packageName ?? "",
    joiningDate: employee.joiningDate ?? "",
    designation: employee.designation ?? "",
    branch: employee.branch ?? "",
    accountNo: employee.accountNo ?? "",
    bankName: employee.bankName ?? "",
    branchName: employee.branchName ?? "",
    ifscCode: employee.ifscCode ?? "",
    adharNo: employee.adharNo ?? "",
    panCardNo: employee.panCardNo ?? "",
    pfUan: employee.pfUan ?? "",
    pfNumber: employee.pfNumber ?? "",
    esicNumber: employee.esicNumber ?? "",
});

const UpdateEmployee = () => {
    const { employeeId } = useParams();
    const { user } = useAuth();
    const formElement = useRef(null);

    const [employee, setEmployee] = useState(null);
    const [form, setForm] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const role = user?.role?.trim().toUpperCase();
    const userBranch = user?.branch?.trim();
    const canChooseBranch =
        role === "SUPER_ADMIN" || userBranch?.toUpperCase() === "ALL";

    useEffect(() => {
        const loadEmployee = async () => {
            try {
                const data =
                    await employeesService.getEmployeeById(employeeId);

                setEmployee(data);
                setForm(createFormFromEmployee(data));
            } catch (error) {
                window.alert(error.message || "Could not load employee.");
            } finally {
                setLoading(false);
            }
        };

        loadEmployee();
    }, [employeeId]);

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
                value={form[name] ?? ""}
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
                value={form[name] ?? ""}
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

            await employeesService.updateEmployee(employeeId, formData);

            window.alert("Employee details updated successfully.");
            navigate(`/employee/view-employee-detail/${employeeId}`);
        } catch (error) {
            window.alert(error.message || "Unable to update employee.");
        } finally {
            setSaving(false);
        }
    };

    const navigate = useNavigate();

    if (loading) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <div className="reg-w3">Loading employee details...</div>
                </section>
            </section>
        );
    }

    if (!form || !employee) {
        return (
            <section id="main-content">
                <section className="wrapper">
                    <div className="reg-w3">
                        Employee details could not be loaded.
                    </div>
                </section>
            </section>
        );
    }

    return (
        <div className="add-employee-page">
            <section id="main-content">
                <section className="wrapper">
                    <div className="reg-w3">
                        <div className="refollowup-card">
                            <div className="refollowup-header">
                                <div className="refollowup-title">
                                    <span className="phone-icon">👤</span>
                                    <div>
                                        <h2>Update Employee Details</h2>
                                        <p>
                                            Update profile details for Employee
                                            ID: {employee.id}
                                        </p>
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
                                        label: "Name",
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
                                        id: "cust_email",
                                        name: "custEmail",
                                        label: "Email",
                                        placeholder: "Enter email address",
                                        type: "email",
                                    })}

                                    {inputField({
                                        id: "cust_alternate",
                                        name: "custAlternate",
                                        label: "Alternate Phone",
                                        placeholder: "Enter alternate phone number",
                                        maxLength: 10,
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
                                        id: "mother_name",
                                        name: "motherName",
                                        label: "Mother's Name",
                                        placeholder: "Enter mother's name",
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

                                {form.maritalStatus === "Married" && (
                                    <div className="form-row" id="spouse_details">
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
                                )}

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
                                        label: "Salary Package",
                                        placeholder: "Enter salary package",
                                        type: "number",
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

                                <h3>KYC Details</h3>
                                <div className="form-row">
                                    {inputField({
                                        id: "adhar_no",
                                        name: "adharNo",
                                        label: "Aadhaar No",
                                        placeholder: "Enter Aadhaar Number",
                                    })}

                                    {inputField({
                                        id: "pan_card_no",
                                        name: "panCardNo",
                                        label: "PAN Card No",
                                        placeholder: "Enter PAN Card Number",
                                    })}
                                </div>

                                <h3>Bank Account Details</h3>
                                <div className="form-row">
                                    {inputField({
                                        id: "account_no",
                                        name: "accountNo",
                                        label: "Account Number",
                                        placeholder: "Enter Account Number",
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

                                <h3>Profile Photo</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="photo">Upload Photo</label>
                                        <input
                                            type="file"
                                            id="photo"
                                            name="photo"
                                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                            onChange={(event) =>
                                                setPhoto(
                                                    event.target.files?.[0] || null
                                                )
                                            }
                                        />
                                    </div>

                                    {employee.photo && (
                                        <div className="form-group">
                                            <label>Current Photo</label>
                                            <img
                                                src={`${API_BASE_URL}/employees/${employeeId}/photo`}
                                                alt="Current employee"
                                                width="150"
                                                height="150"
                                            />
                                        </div>
                                    )}
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
                                    <span>💾</span>
                                    {saving ? "Saving..." : "Update Profile"}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </section>
        </div>
    );
};
export default UpdateEmployee;