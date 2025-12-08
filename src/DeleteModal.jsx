import React from "react";

const DeleteModal = ({visible, onCancel, onConfirm}) => {
    if (!visible) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white w-96 p-6 rounded shadow space-y-4">
                <h2 className="text-xl font-semibold">Are you sure you want to delete?</h2>
                <div className="flex justify-end gap-4">
                    <button onClick={onCancel} className="px-4 py-2 border rounded">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
