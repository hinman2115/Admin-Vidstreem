import {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import "./css/VidStreemDashboard.css";

function VidStreemDashboard() {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [editForm, setEditForm] = useState({title: "", categoryName: ""});

    useEffect(() => {
        axios.get("/api/VideohandelApi/thumbnails?take=50&skip=0")
            .then(res => {
                const transformedVideos = res.data.map(video => ({
                    ...video,
                    thumbnailUrl: video.thumbnailUrl?.replace(
                        "http://vidstreem.runasp.net",
                        ""
                    )
                }));
                setVideos(transformedVideos);
            })
            .catch(err => {
                console.error("Error while fetching videos:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Open delete confirmation modal
    const handleDeleteClick = (video) => {
        setSelectedVideo(video);
        setShowDeleteModal(true);
    };

    // Confirm delete
    const confirmDelete = async () => {
        try {
            await axios.delete(`http://vidstreem.runasp.net/api/VideohandelApi/${selectedVideo.id}`);
            setVideos(prev => prev.filter(v => v.id !== selectedVideo.id));
            setShowDeleteModal(false);
            setSelectedVideo(null);
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete video");
        }
    };

    // Open edit modal
    const handleEditClick = (video) => {
        setSelectedVideo(video);
        setEditForm({
            title: video.title,
            categoryName: video.categoryName
        });
        setShowEditModal(true);
    };

    // Confirm edit
    const confirmEdit = async () => {
        try {
            await axios.put(`http://vidstreem.runasp.net/api/VideohandelApi/${selectedVideo.id}`, {
                ...selectedVideo,
                title: editForm.title,
                categoryName: editForm.categoryName
            });

            // Update local state
            setVideos(prev => prev.map(v =>
                v.id === selectedVideo.id
                    ? {...v, title: editForm.title, categoryName: editForm.categoryName}
                    : v
            ));

            setShowEditModal(false);
            setSelectedVideo(null);
            setEditForm({title: "", categoryName: ""});
        } catch (err) {
            console.error("Edit failed:", err);
            alert("Failed to update video");
        }
    };

    const filtered = videos.filter(v =>
        v.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        navigate("/auth");
    };

    const handleAddVideo = () => {
        navigate("/uploadvideo");
    };

    if (loading) {
        return (
            <div style={styles.fullscreenCenter}>
                <div style={styles.spinner}/>
                <p style={{marginTop: 12, color: "#ff6b00"}}>Loading VidStreem...</p>
            </div>
        );
    }

    const userName = localStorage.getItem("name") || "Admin";
    const userInitials = userName
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div style={styles.appShell}>
            {/* Sidebar */}
            <aside
                style={{
                    ...styles.sidebar,
                    width: sidebarCollapsed ? 80 : 240,
                }}
            >
                <div style={styles.sidebarBrand}>
                    {sidebarCollapsed ? (
                        <span style={styles.brandMini}>VS</span>
                    ) : (
                        <span style={styles.brandFull}>
                            Vid<span style={{color: "#ff6b00"}}>Streem</span>
                        </span>
                    )}
                </div>

                <nav style={styles.navList}>
                    <button style={{...styles.navItem, ...styles.navItemActive}}>
                        <span style={styles.navIcon}>▣</span>
                        {!sidebarCollapsed && <span>Dashboard</span>}
                    </button>

                    <button style={styles.navItem}>
                        <span style={styles.navIcon}>▶</span>
                        {!sidebarCollapsed && <span>Videos</span>}
                    </button>
                    <button style={styles.navItem}>
                        <span style={styles.navIcon}>▦</span>
                        {!sidebarCollapsed && <span>Categories</span>}
                    </button>
                    <button style={styles.navItem}>
                        <span style={styles.navIcon}>📈</span>
                        {!sidebarCollapsed && <span>Analytics</span>}
                    </button>
                    <button style={styles.navItem}>
                        <span style={styles.navIcon}>⚙</span>
                        {!sidebarCollapsed && <span>Settings</span>}
                    </button>
                </nav>

                <button
                    style={styles.collapse}
                    onClick={() => setSidebarCollapsed(v => !v)}
                >
                    {sidebarCollapsed ? "»" : "«"}
                </button>
            </aside>

            {/* Main area */}
            <div
                style={{
                    ...styles.mainArea,
                    marginLeft: sidebarCollapsed ? 80 : 240,
                }}
            >
                {/* Top bar */}
                <header style={styles.topBar}>
                    <div>
                        <h1 style={styles.topTitle}>Video Management</h1>
                        <p style={styles.breadcrumb}>Dashboard / Videos</p>
                    </div>

                    <div style={styles.topRight}>
                        <div style={styles.searchBox}>
                            <input
                                style={styles.searchInput}
                                placeholder="Search videos..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button style={styles.primaryBtn} onClick={handleAddVideo}>
                            + Add Video
                        </button>

                        {/* Avatar with dropdown */}
                        <div style={styles.avatarContainer}>
                            <div
                                style={styles.avatar}
                                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                            >
                                {userInitials}
                            </div>

                            {showAvatarMenu && (
                                <div style={styles.avatarMenu}>
                                    <div style={styles.menuHeader}>
                                        <p style={styles.menuName}>{userName}</p>
                                        <p style={styles.menuEmail}>
                                            {localStorage.getItem("role") || "User"}
                                        </p>
                                    </div>
                                    <div style={styles.menuDivider}/>
                                    <button
                                        style={styles.menuItem}
                                        onClick={() => navigate("/profile")}
                                    >
                                        <span style={styles.menuIcon}>👤</span>
                                        Profile
                                    </button>
                                    <button
                                        style={styles.menuItem}
                                        onClick={() => navigate("/settings")}
                                    >
                                        <span style={styles.menuIcon}>⚙</span>
                                        Settings
                                    </button>
                                    <div style={styles.menuDivider}/>
                                    <button
                                        style={styles.menuItemDanger}
                                        onClick={handleLogout}
                                    >
                                        <span style={styles.menuIcon}>🚪</span>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content scroll area */}
                <div style={styles.contentScroll}>
                    {/* Stats row */}
                    <div style={styles.statsRow}>
                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>▶</div>
                            <div>
                                <p style={styles.statLabel}>Total Videos</p>
                                <h3 style={styles.statValue}>{videos.length}</h3>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div style={styles.statIconAlt}>▦</div>
                            <div>
                                <p style={styles.statLabel}>Categories</p>
                                <h3 style={styles.statValue}>
                                    {[...new Set(videos.map(v => v.categoryName))].length}
                                </h3>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div style={styles.statIconWarn}>👁</div>
                            <div>
                                <p style={styles.statLabel}>Total Views</p>
                                <h3 style={styles.statValue}>12.5K</h3>
                            </div>
                        </div>
                    </div>

                    {/* Table card */}
                    <section style={styles.tableCard}>
                        <div style={styles.tableHeaderRow}>
                            <h2 style={{margin: 0, fontSize: 18, color: "#000"}}>Video Library</h2>
                            <button style={styles.chipBtn}>Filter</button>
                        </div>

                        <div style={styles.tableHead}>
                            <div style={{...styles.th, flex: 0.5}}>#</div>
                            <div style={{...styles.th, flex: 1}}>Thumbnail</div>
                            <div style={{...styles.th, flex: 3}}>Title</div>
                            <div style={{...styles.th, flex: 1.5}}>Category</div>
                            <div style={{...styles.th, flex: 2}}>Actions</div>
                        </div>

                        <div style={styles.tableBody}>
                            {filtered.map((v, idx) => (
                                <div key={v.id} style={styles.tr}>
                                    <div style={{...styles.td, flex: 0.5, color: "#000"}}>{idx + 1}</div>
                                    <div style={{...styles.td, flex: 1}}>
                                        <img
                                            src={v.thumbnailUrl}
                                            alt={v.title}
                                            style={styles.thumb}
                                        />
                                    </div>
                                    <div style={{...styles.td, flex: 3, color: "#000"}}>{v.title}</div>
                                    <div style={{...styles.td, flex: 1.5}}>
                                        <span style={styles.tag}>{v.categoryName}</span>
                                    </div>
                                    <div style={{ ...styles.td, flex: 2 }}>
                                        <button style={styles.smallPrimary} onClick={() => handleEditClick(v)}>
                                            Edit
                                        </button>
                                        <button style={styles.smallDanger} onClick={() => handleDeleteClick(v)}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>🗑️ Delete Video</h3>
                            <button
                                style={styles.modalClose}
                                onClick={() => setShowDeleteModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div style={styles.modalBody}>
                            <p style={styles.modalText}>
                                Are you sure you want to delete <strong>"{selectedVideo?.title}"</strong>?
                            </p>
                            <p style={styles.modalWarning}>
                                This action cannot be undone.
                            </p>
                        </div>

                        <div style={styles.modalFooter}>
                            <button
                                style={styles.modalBtnSecondary}
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                style={styles.modalBtnDanger}
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
                    <div style={styles.modalContentLarge} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>✏️ Edit Video</h3>
                            <button
                                style={styles.modalClose}
                                onClick={() => setShowEditModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div style={styles.modalBody}>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Title</label>
                                <input
                                    type="text"
                                    style={styles.formInput}
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                    placeholder="Enter video title"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Category</label>
                                <input
                                    type="text"
                                    style={styles.formInput}
                                    value={editForm.categoryName}
                                    onChange={(e) => setEditForm({...editForm, categoryName: e.target.value})}
                                    placeholder="Enter category name"
                                />
                            </div>

                            {selectedVideo?.thumbnailUrl && (
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Current Thumbnail</label>
                                    <img
                                        src={selectedVideo.thumbnailUrl}
                                        alt="Thumbnail"
                                        style={styles.modalThumb}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={styles.modalFooter}>
                            <button
                                style={styles.modalBtnSecondary}
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                style={styles.modalBtnPrimary}
                                onClick={confirmEdit}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    appShell: {
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        background: "#f5f6fb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#000",
    },
    fullscreenCenter: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff5ec",
    },
    spinner: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "4px solid #ffe2c2",
        borderTopColor: "#ff6b00",
        animation: "spin 1s linear infinite",
    },
    sidebar: {
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        background: "linear-gradient(180deg,#ffffff,#fff6ec)",
        borderRight: "1px solid rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
    },
    sidebarBrand: {
        padding: "20px 18px",
        borderBottom: "1px solid rgba(0,0,0,0.04)",
    },
    brandFull: {fontWeight: 700, fontSize: 22, color: "#000"},
    brandMini: {fontWeight: 700, fontSize: 18, color: "#ff6b00"},
    navList: {
        flex: 1,
        padding: "12px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
    },
    navItem: {
        border: "none",
        background: "transparent",
        borderRadius: 12,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: "#000",
        cursor: "pointer",
        fontSize: 14,
        transition: "all 0.2s",
    },
    navItemActive: {
        background: "linear-gradient(90deg,#ffe4c2,#fff)",
        color: "#ff6b00",
        boxShadow: "0 0 0 1px rgba(255,107,0,0.25)",
    },
    navIcon: {fontSize: 16, width: 20, textAlign: "center"},
    collapse: {
        margin: 12,
        padding: "8px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,107,0,0.3)",
        background: "#fff7ee",
        color: "#ff6b00",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
    },
    mainArea: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: "#f5f6fb",
        transition: "margin-left 0.3s ease",
    },
    topBar: {
        position: "sticky",
        top: 0,
        zIndex: 10,
        padding: "16px 28px",
        background: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(0,0,0,0.04)",
        flexWrap: "wrap",
        gap: 12,
    },
    topTitle: {margin: 0, fontSize: 22, fontWeight: 700, color: "#000"},
    breadcrumb: {margin: 0, fontSize: 12, color: "#000", marginTop: 2, opacity: 0.6},
    topRight: {display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"},
    searchBox: {position: "relative"},
    searchInput: {
        padding: "8px 12px",
        borderRadius: 999,
        border: "1px solid rgba(0,0,0,0.12)",
        fontSize: 14,
        minWidth: 220,
        outline: "none",
        color: "#000",
    },
    primaryBtn: {
        padding: "9px 18px",
        borderRadius: 999,
        border: "none",
        background: "linear-gradient(135deg,#ff6b00,#ff8c1a)",
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "transform 0.2s",
    },
    avatarContainer: {
        position: "relative",
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "#ff6b00",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "transform 0.2s",
    },
    avatarMenu: {
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        background: "#ffffff",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        minWidth: 200,
        padding: 8,
        zIndex: 1000,
    },
    menuHeader: {
        padding: "12px 12px 8px",
    },
    menuName: {
        margin: 0,
        fontSize: 14,
        fontWeight: 600,
        color: "#000",
    },
    menuEmail: {
        margin: 0,
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    menuDivider: {
        height: 1,
        background: "rgba(0,0,0,0.08)",
        margin: "8px 0",
    },
    menuItem: {
        width: "100%",
        padding: "10px 12px",
        border: "none",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 14,
        color: "#000",
        cursor: "pointer",
        borderRadius: 8,
        transition: "background 0.2s",
        textAlign: "left",
    },
    menuItemDanger: {
        width: "100%",
        padding: "10px 12px",
        border: "none",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 14,
        color: "#e03131",
        cursor: "pointer",
        borderRadius: 8,
        transition: "background 0.2s",
        textAlign: "left",
        fontWeight: 600,
    },
    menuIcon: {
        fontSize: 16,
        width: 20,
        textAlign: "center",
    },
    contentScroll: {
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: "24px 28px 32px",
    },
    statsRow: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
        gap: 20,
        marginBottom: 24,
    },
    statCard: {
        background: "#ffffff",
        borderRadius: 16,
        padding: 16,
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
        transition: "transform 0.2s, box-shadow 0.2s",
    },
    statIcon: {
        width: 46,
        height: 46,
        borderRadius: 14,
        background: "linear-gradient(135deg,#ff6b00,#ff9c3a)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
    },
    statIconAlt: {
        width: 46,
        height: 46,
        borderRadius: 14,
        background: "linear-gradient(135deg,#ff8c1a,#ffb347)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
    },
    statIconWarn: {
        width: 46,
        height: 46,
        borderRadius: 14,
        background: "linear-gradient(135deg,#ff5b57,#ff9f7f)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
    },
    statLabel: {margin: 0, fontSize: 12, color: "#000", textTransform: "uppercase", opacity: 0.6},
    statValue: {margin: 0, fontSize: 22, fontWeight: 700, color: "#000", marginTop: 4},
    tableCard: {
        background: "#ffffff",
        borderRadius: 16,
        boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
        padding: 16,
        minWidth: 0,
        overflow: "hidden",
    },
    tableHeaderRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    chipBtn: {
        borderRadius: 999,
        border: "1px solid rgba(255,107,0,0.4)",
        background: "#fff7ee",
        color: "#ff6b00",
        padding: "6px 14px",
        fontSize: 13,
        cursor: "pointer",
        fontWeight: 600,
    },
    tableHead: {
        display: "flex",
        padding: "10px 12px",
        borderRadius: 10,
        background: "#fff7ee",
        fontSize: 12,
        color: "#000",
        fontWeight: 600,
        opacity: 0.7,
    },
    th: {textTransform: "uppercase"},
    tableBody: {
        marginTop: 4,
        maxHeight: "calc(100vh - 360px)",
        overflowY: "auto",
    },
    tr: {
        display: "flex",
        alignItems: "center",
        padding: "10px 12px",
        borderBottom: "1px solid rgba(0,0,0,0.03)",
        fontSize: 14,
        transition: "background 0.2s",
        color: "#000",
    },
    td: {display: "flex", alignItems: "center", gap: 8},
    thumb: {
        width: 80,
        height: 48,
        borderRadius: 8,
        objectFit: "cover",
        border: "1px solid rgba(0,0,0,0.06)",
    },
    tag: {
        padding: "4px 10px",
        borderRadius: 999,
        background: "#fff7ee",
        color: "#ff6b00",
        fontSize: 12,
        fontWeight: 600,
    },
    smallPrimary: {
        padding: "6px 10px",
        marginRight: 6,
        borderRadius: 6,
        border: "none",
        background: "linear-gradient(135deg,#ff6b00,#ff8c1a)",
        color: "#fff",
        fontSize: 12,
        cursor: "pointer",
        fontWeight: 600,
        transition: "transform 0.2s",
    },
    smallDanger: {
        padding: "6px 10px",
        borderRadius: 6,
        border: "none",
        background: "linear-gradient(135deg,#e03131,#ff5b57)",
        color: "#fff",
        fontSize: 12,
        cursor: "pointer",
        fontWeight: 600,
        transition: "transform 0.2s",
    },

    // Modal Styles
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        backdropFilter: "blur(4px)",
    },
    modalContent: {
        background: "#ffffff",
        borderRadius: 20,
        width: "90%",
        maxWidth: 460,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        animation: "slideUp 0.3s ease",
    },
    modalContentLarge: {
        background: "#ffffff",
        borderRadius: 20,
        width: "90%",
        maxWidth: 560,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        animation: "slideUp 0.3s ease",
    },
    modalHeader: {
        padding: "24px 24px 16px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    modalTitle: {
        margin: 0,
        fontSize: 20,
        fontWeight: 700,
        color: "#000",
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    modalClose: {
        border: "none",
        background: "transparent",
        fontSize: 32,
        color: "#666",
        cursor: "pointer",
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        transition: "background 0.2s",
        lineHeight: 1,
        padding: 0,
    },
    modalBody: {
        padding: "24px",
    },
    modalText: {
        margin: 0,
        fontSize: 15,
        color: "#000",
        lineHeight: 1.6,
    },
    modalWarning: {
        margin: "12px 0 0",
        fontSize: 13,
        color: "#e03131",
        fontWeight: 600,
    },
    modalFooter: {
        padding: "16px 24px 24px",
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
    },
    modalBtnSecondary: {
        padding: "10px 24px",
        borderRadius: 999,
        border: "1px solid rgba(0,0,0,0.15)",
        background: "#ffffff",
        color: "#000",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
    },
    modalBtnDanger: {
        padding: "10px 24px",
        borderRadius: 999,
        border: "none",
        background: "linear-gradient(135deg,#e03131,#ff5b57)",
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "transform 0.2s",
    },
    modalBtnPrimary: {
        padding: "10px 24px",
        borderRadius: 999,
        border: "none",
        background: "linear-gradient(135deg,#ff6b00,#ff8c1a)",
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "transform 0.2s",
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        display: "block",
        marginBottom: 8,
        fontSize: 14,
        fontWeight: 600,
        color: "#000",
    },
    formInput: {
        width: "100%",
        padding: "12px 16px",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.12)",
        fontSize: 14,
        color: "#000",
        outline: "none",
        transition: "border 0.2s",
        boxSizing: "border-box",
    },
    modalThumb: {
        width: "100%",
        maxWidth: 320,
        height: "auto",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
    },
};

export default VidStreemDashboard;
