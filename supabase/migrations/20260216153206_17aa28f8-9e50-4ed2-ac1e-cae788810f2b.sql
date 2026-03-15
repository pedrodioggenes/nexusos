UPDATE storage.buckets 
SET file_size_limit = 5368709120
WHERE id IN ('campaign-media', 'trade-proofs', 'workspace-files', 'demand-attachments', 'hiperia-documents');