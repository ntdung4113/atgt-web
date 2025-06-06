import React, { useState } from 'react';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('laws');

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        // TODO: Implement file upload logic
        console.log(`Uploading ${type}:`, file);
    };

    return (
        <div className="admin-dashboard">
            <h1>Quản lý nội dung</h1>

            <div className="admin-tabs">
                <button
                    className={`tab-button ${activeTab === 'laws' ? 'active' : ''}`}
                    onClick={() => setActiveTab('laws')}
                >
                    Văn bản pháp luật
                </button>
                <button
                    className={`tab-button ${activeTab === 'questions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('questions')}
                >
                    Câu hỏi
                </button>
                <button
                    className={`tab-button ${activeTab === 'scenarios' ? 'active' : ''}`}
                    onClick={() => setActiveTab('scenarios')}
                >
                    Tình huống giao thông
                </button>
            </div>

            <div className="admin-content">
                {activeTab === 'laws' && (
                    <div className="admin-section">
                        <h2>Quản lý văn bản pháp luật</h2>
                        <div className="upload-section">
                            <h3>Tải lên văn bản mới</h3>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => handleFileUpload(e, 'law')}
                            />
                            <div className="form-group">
                                <label>Loại văn bản:</label>
                                <select>
                                    <option value="law">Luật</option>
                                    <option value="decree">Nghị định</option>
                                    <option value="circular">Thông tư</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tiêu đề:</label>
                                <input type="text" />
                            </div>
                            <div className="form-group">
                                <label>Mô tả:</label>
                                <textarea></textarea>
                            </div>
                            <button className="submit-btn">Tải lên</button>
                        </div>
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="admin-section">
                        <h2>Quản lý câu hỏi</h2>
                        <div className="upload-section">
                            <h3>Thêm câu hỏi mới</h3>
                            <div className="form-group">
                                <label>Chủ đề:</label>
                                <select>
                                    <option value="1">Khái niệm và quy tắc giao thông</option>
                                    <option value="2">Nghiệp vụ vận tải</option>
                                    <option value="3">Văn hóa giao thông</option>
                                    <option value="4">Kỹ thuật lái xe</option>
                                    <option value="5">Cấu tạo và sửa chữa xe</option>
                                    <option value="6">Hệ thống biển báo</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Nội dung câu hỏi:</label>
                                <textarea></textarea>
                            </div>
                            <div className="form-group">
                                <label>Đáp án:</label>
                                <div className="answer-options">
                                    {['A', 'B', 'C', 'D'].map((option) => (
                                        <div key={option} className="answer-option">
                                            <input type="radio" name="correct" value={option} />
                                            <input type="text" placeholder={`Đáp án ${option}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button className="submit-btn">Thêm câu hỏi</button>
                        </div>
                    </div>
                )}

                {activeTab === 'scenarios' && (
                    <div className="admin-section">
                        <h2>Quản lý tình huống giao thông</h2>
                        <div className="upload-section">
                            <h3>Thêm tình huống mới</h3>
                            <div className="form-group">
                                <label>Hình ảnh:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'scenario')}
                                />
                            </div>
                            <div className="form-group">
                                <label>Tiêu đề:</label>
                                <input type="text" />
                            </div>
                            <div className="form-group">
                                <label>Mô tả:</label>
                                <textarea></textarea>
                            </div>
                            <div className="form-group">
                                <label>Giải pháp:</label>
                                <textarea></textarea>
                            </div>
                            <button className="submit-btn">Thêm tình huống</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard; 