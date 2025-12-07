"use client"
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import Sidebar from "@/components/admin/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function AdminUserEdit() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [user, setUser] = useState({
        fullName: "",
        email: "",
        phone: "",
        roleName: "USER",
        avatar: ""
    })

    const [avatarFile, setAvatarFile] = useState(null)
    const [preview, setPreview] = useState(null)

    const [loading, setLoading] = useState(true)

    // -------- LOAD DATA --------
    useEffect(() => {
        const token = localStorage.getItem("token")

        axios.get(`http://localhost:8080/api/admin/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setUser(res.data)
                setPreview(res.data.avatar)
                setLoading(false)
            })
            .catch(err => {
                console.error("Lỗi load user:", err)
                setLoading(false)
            })
    }, [id])

    // -------- HANDLE CHANGE --------
    const handleChange = (e) => {
        const { name, value } = e.target
        setUser(prev => ({ ...prev, [name]: value }))
    }

    // -------- HANDLE IMAGE --------
    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        setAvatarFile(file)
        setPreview(URL.createObjectURL(file))
    }

    // -------- SUBMIT --------
    const handleSubmit = (e) => {
        e.preventDefault()

        const token = localStorage.getItem("token")

        const formData = new FormData()
        formData.append(
            "user",
            new Blob([JSON.stringify(user)], { type: "application/json" })
        )
        if (avatarFile) {
            formData.append("avatar", avatarFile)
        }

        axios.put(`http://localhost:8080/api/admin/users/${id}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            }
        })
            .then(() => {
                alert("Cập nhật user thành công")
                navigate(`/admin/users/${id}`)
            })
            .catch(err => {
                console.error("Lỗi cập nhật user:", err.response?.data || err.message)
                alert("Cập nhật thất bại: " + (err.response?.data || err.message))
            })
    }

    // -------- UI LOADING --------
    if (loading) return <div className="flex justify-center items-center h-screen">Đang tải...</div>

    // -------- RENDER UI --------
    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar />

            <div className="flex-1 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        className="flex items-center px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold">Chỉnh sửa người dùng</h1>
                </div>

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">Thông tin cơ bản</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* ===== HỌ TÊN ===== */}
                            <div>
                                <label className="block text-slate-500 mb-1">Họ và tên</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={user.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                />
                            </div>

                            {/* ===== EMAIL ===== */}
                            <div>
                                <label className="block text-slate-500 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={user.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                />
                            </div>

                            {/* ===== PHONE ===== */}
                            <div>
                                <label className="block text-slate-500 mb-1">Số điện thoại</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={user.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                />
                            </div>

                            {/* ===== ROLE ===== */}
                            <div>
                                <label className="block text-slate-500 mb-1">Vai trò</label>
                                <select
                                    name="roleName"
                                    value={user.roleName || "USER"}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            {/* ===== AVATAR UPLOAD ===== */}
                            <div>
                                <label className="block text-slate-500 mb-1">Ảnh đại diện</label>

                                {preview && (
                                    <img
                                        src={preview}
                                        className="w-24 h-24 object-cover rounded-full mb-4 border"
                                        alt="avatar preview"
                                    />
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>

                            {/* ===== BUTTONS ===== */}
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
                                    onClick={() => navigate(-1)}
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                >
                                    Lưu
                                </button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
