import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Heading,
  Text,
  ProgressCircle,
  InlineAlert,
  Content,
  Badge,
  Divider,
  TextField
} from '@react-spectrum/s2';
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import DataRefreshIcon from '@react-spectrum/s2/icons/DataRefresh';
import UploadIcon from '@react-spectrum/s2/icons/Upload';
import LinkIcon from '@react-spectrum/s2/icons/Link';
import DeleteIcon from '@react-spectrum/s2/icons/Delete';
// import GuideSection from './GuideSection';

import actionWebInvoke from '../../utils';
import allActions from '../../config.json';

const uploadUrl = allActions['Adobe/file-storage'];
const listUrl = allActions['Adobe/file-list'];
const shareUrl = allActions['files-storage/share'];
const deleteUrl = allActions['files-storage/delete'];

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [shareLinks, setShareLinks] = useState({});
  const [sharingFile, setSharingFile] = useState(null);
  const [copiedFile, setCopiedFile] = useState(null);
  const [deletingFile, setDeletingFile] = useState(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await actionWebInvoke(listUrl, {}, {}, { method: 'GET' });
      const rawFiles = response.files || response.body?.files || [];
      const normalized = rawFiles.map(f => (typeof f === 'string' ? f : f.name || f.path || String(f)));
      setFiles(normalized);
    } catch (err) {
      console.error('Error listing files:', err);
      setError('Failed to load files: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const reader = new FileReader();
      const fileData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await actionWebInvoke('api/v1/web/Adobe/file-storage', {}, {
        filename: file.name,
        fileData
      });

      setSuccess(`"${file.name}" uploaded successfully`);
      e.target.value = '';
      await fetchFiles();
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // const handleDelete = async (filename) => {
  //   if (!window.confirm(`Delete "${filename}"?`)) return;

  //   setDeletingFile(filename);
  //   setError(null);
  //   setSuccess(null);

  //   try {
  //     await actionWebInvoke(deleteUrl, {}, { filename });
  //     setShareLinks(prev => {
  //       const updated = { ...prev };
  //       delete updated[filename];
  //       return updated;
  //     });
  //     setSuccess(`"${filename}" deleted`);
  //     await fetchFiles();
  //   } catch (err) {
  //     console.error('Delete error:', err);
  //     setError('Failed to delete: ' + err.message);
  //   } finally {
  //     setDeletingFile(null);
  //   }
  // };

  const copyToClipboard = async (filename) => {
    try {
      await navigator.clipboard.writeText(shareLinks[filename]);
      setCopiedFile(filename);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const getFileExtension = (name) => {
    const str = String(name || '');
    const ext = str.split('.').pop().toLowerCase();
    return ext !== str ? ext : '';
  };

  const getExtBadgeVariant = (ext) => {
    const map = {
      pdf: 'negative', doc: 'informative', docx: 'informative',
      jpg: 'positive', jpeg: 'positive', png: 'positive', gif: 'positive', webp: 'positive',
      txt: 'neutral', csv: 'neutral', json: 'neutral',
      zip: 'notice', gz: 'notice', tar: 'notice'
    };
    return map[ext] || 'neutral';
  };

  const formatFileName = (path) => {
    const str = String(path || '');
    const parts = str.split('/');
    return parts[parts.length - 1];
  };

  const formatFilePath = (path) => {
    const str = String(path || '');
    const parts = str.split('/');
    if (parts.length <= 1) return '';
    return parts.slice(0, -1).join('/') + '/';
  };

  return (
    <div className={style({ width: 'full' })}>
      <div className={style({
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 8
      })}>
        <Heading level={1} styles={style({ margin: 0 })}>
          File Manager
        </Heading>
        <Badge variant="informative" size="S">{files.length} files</Badge>
      </div>
      <Text styles={style({ font: "body-lg", color: "gray-700", display: "block", marginBottom: 24 })}>
        Upload files to cloud storage and generate public share links.
      </Text>
      <Divider />

      {/* Upload section */}
      <div className={style({
        marginTop: 24,
        marginBottom: 24,
        padding: 24,
        backgroundColor: "layer-2",
        borderRadius: "xl",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "gray-200"
      })}>
        <Heading level={3} styles={style({ marginBottom: 12 })}>Upload a File</Heading>
        <div className={style({
          display: "flex",
          alignItems: "center",
          gap: 12
        })}>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              backgroundColor: uploading ? '#e0e0e0' : '#0265DC',
              color: '#fff',
              borderRadius: 8,
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 500,
              transition: 'background-color 0.2s'
            }}
          >
            <UploadIcon size="S" />
            {uploading ? 'Uploading...' : 'Choose File'}
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
          {uploading && <ProgressCircle aria-label="Uploading file" isIndeterminate size="S" />}
        </div>
        <Text styles={style({ font: "body-xs", color: "gray-500", display: "block", marginTop: 8 })}>
          Select any file to upload. It will be stored in Adobe cloud storage.
        </Text>
      </div>

      {/* Alerts */}
      {error && (
        <div className={style({ marginBottom: 16 })}>
          <InlineAlert variant="negative">
            <Heading>Error</Heading>
            <Content><Text>{error}</Text></Content>
          </InlineAlert>
        </div>
      )}
      {success && (
        <div className={style({ marginBottom: 16 })}>
          <InlineAlert variant="positive">
            <Heading>Success</Heading>
            <Content><Text>{success}</Text></Content>
          </InlineAlert>
        </div>
      )}

      {/* File list header */}
      <div className={style({
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12
      })}>
        <Heading level={3} styles={style({ margin: 0 })}>Stored Files</Heading>
        <Button variant="secondary" onPress={fetchFiles} isDisabled={loading}>
          <DataRefreshIcon />
          <Text>{loading ? 'Loading...' : 'Refresh'}</Text>
        </Button>
      </div>

      {/* Loading state */}
      {loading && files.length === 0 && (
        <div className={style({
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 64,
          gap: 16
        })}>
          <ProgressCircle aria-label="Loading files" isIndeterminate size="L" />
          <Text styles={style({ color: "gray-600" })}>Loading files...</Text>
        </div>
      )}

      {/* Empty state */}
      {!loading && files.length === 0 && (
        <div className={style({
          padding: 48,
          textAlign: "center",
          backgroundColor: "layer-2",
          borderRadius: "xl",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "gray-200"
        })}>
          <Text styles={style({ font: "body-lg", color: "gray-500", display: "block", marginBottom: 8 })}>
            No files yet
          </Text>
          <Text styles={style({ font: "body-sm", color: "gray-400" })}>
            Upload your first file using the button above.
          </Text>
        </div>
      )}

      {/* File grid */}
      {files.length > 0 && (
        <div className={style({
          display: "flex",
          flexDirection: "column",
          gap: 8
        })}>
          {files.map((filePath, index) => {
            const ext = getFileExtension(filePath);
            const name = formatFileName(filePath);
            const dir = formatFilePath(filePath);

            return (
              <div
                key={filePath + index}
                className={style({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  backgroundColor: "layer-2",
                  borderRadius: "lg",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "gray-200",
                  transition: "default"
                })}
              >
                <div className={style({
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  overflow: "hidden"
                })}>
                  {ext && <Badge variant={getExtBadgeVariant(ext)} size="S">{ext.toUpperCase()}</Badge>}
                  <div>
                    <Text styles={style({ font: "body", fontWeight: "bold", display: "block" })}>
                      {name}
                    </Text>
                    {dir && (
                      <Text styles={style({ font: "body-xs", color: "gray-500" })}>
                        {dir}
                      </Text>
                    )}
                  </div>
                </div>

                <div className={style({
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                })}>
                  {shareLinks[filePath] && (
                    <TextField
                      aria-label="Share URL"
                      value={shareLinks[filePath]}
                      isReadOnly
                      width="size-3000"
                      size="S"
                    />
                  )}
                  
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileManager;
