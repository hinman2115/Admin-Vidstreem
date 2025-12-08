import React from "react";

const EditModal = ({visible, title, onCancel, onSave, setTitle}) => {
    if (!visible) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white w-96 p-6 rounded shadow space-y-4">
                <h2 className="text-xl font-semibold">Edit Video</h2>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border p-2 w-full rounded"
                />
                <div className="flex justify-end gap-4">
                    <button onClick={onCancel} className="px-4 py-2 border rounded">
                        Cancel
                    </button>
                    <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
