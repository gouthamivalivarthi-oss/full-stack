import React, { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import {
  FolderArchive,
  FileText,
  Download,
  Trash2,
  Upload,
  Search,
  Calendar,
  HardDrive,
  FileCode,
  FileSpreadsheet,
  FileImage,
  Sparkles,
} from 'lucide-react';

export const FileVault = () => {
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadProjectId, setUploadProjectId] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { addToast } = useNotifications();

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const [filesRes, projRes] = await Promise.all([
        api.get('/files'),
        api.get('/projects'),
      ]);
      if (filesRes.data.success) {
        setFiles(filesRes.data.files || []);
      }
      if (projRes.data.success) {
        setProjects(projRes.data.projects || []);
        if (projRes.data.projects?.length > 0) {
          setUploadProjectId(projRes.data.projects[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load file vault', err);
      addToast({
        title: 'Error',
        message: 'Could not fetch files',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadProjectId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('projectId', uploadProjectId);

    try {
      const res = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setFiles((prev) => [res.data.file, ...prev]);
        setUploadModalOpen(false);
        setUploadFile(null);
        addToast({
          title: 'File Uploaded',
          message: 'Deliverable has been saved to the vault.',
          type: 'success',
        });
      }
    } catch (err) {
      addToast({
        title: 'Upload failed',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const res = await api.delete(`/files/${fileId}`);
      if (res.data.success) {
        setFiles((prev) => prev.filter((f) => f._id !== fileId));
        addToast({
          title: 'File Deleted',
          message: 'File removed from vault.',
          type: 'success',
        });
      }
    } catch (err) {
      addToast({
        title: 'Delete failed',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  const getFileIcon = (mimetype = '') => {
    if (mimetype.includes('image')) return <FileImage className="w-5 h-5 text-rose-500" />;
    if (mimetype.includes('pdf') || mimetype.includes('text'))
      return <FileText className="w-5 h-5 text-sky-500" />;
    if (mimetype.includes('sheet') || mimetype.includes('csv'))
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    return <FileCode className="w-5 h-5 text-indigo-500" />;
  };

  const filteredFiles = files.filter(
    (f) =>
      f.originalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.project?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project File Vault</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Central repository for design assets, documents, architecture specs, and release artifacts.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="btn-primary text-xs font-semibold px-4 py-2.5"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search files by name or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 text-xs"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {filteredFiles.length} file{filteredFiles.length === 1 ? '' : 's'} stored
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading file vault..." />
      ) : filteredFiles.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400">
          <FolderArchive className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No Files Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery
              ? 'No files matched your search query.'
              : 'Upload your first project deliverable or documentation asset.'}
          </p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="btn-primary text-xs mt-4"
          >
            <Upload className="w-4 h-4" /> Upload File
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFiles.map((file) => (
            <div
              key={file._id}
              className="glass-card p-5 flex flex-col justify-between hover:border-sky-300 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-sky-50 transition-colors">
                    {getFileIcon(file.mimetype)}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>

                <h4
                  className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-sky-600 transition-colors"
                  title={file.originalName}
                >
                  {file.originalName}
                </h4>

                <p className="text-[11px] text-sky-600 font-semibold mt-1 truncate">
                  {file.project?.name || 'Workspace File'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {new Date(file.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1">
                  <a
                    href={`${API_BASE_URL}/files/${file._id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-500 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDeleteFile(file._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload File to Project Vault"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Target Project *
            </label>
            <select
              value={uploadProjectId}
              onChange={(e) => setUploadProjectId(e.target.value)}
              className="input-field text-xs"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Choose File *
            </label>
            <input
              type="file"
              required
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="input-field text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !uploadFile}
              className="btn-primary text-xs px-5 py-2"
            >
              {uploading ? 'Uploading...' : 'Upload Now'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FileVault;
