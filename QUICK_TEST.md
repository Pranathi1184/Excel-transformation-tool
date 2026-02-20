# Quick Test Guide

## 🧪 Manual Testing Steps

### Test 1: Single File Mode (5 minutes)

1. **Start the app**:
   ```bash
   cd c:\Users\jarvi\Case_Study
   npm start
   ```

2. **Open browser**: http://localhost:5173 (or 5174)

3. **Upload file**:
   - Click "Transform Single File"
   - Upload any .xlsx file
   - Should navigate to `/preview`

4. **Check Preview**:
   - ✅ Table should show data rows (not "No data available")
   - ✅ Console should show "API call starting..."
   - ✅ Network tab should show GET `/api/v1/preview-sheet` with 200 status

5. **Build Pipeline**:
   - Click "Next: Build Pipeline"
   - Add a filter operation
   - Click "Validate & Preview"
   - Should show transformed data

6. **Download**:
   - Click "Download Transformed File"
   - File should download

**Expected Result**: ✅ All steps work without errors

---

### Test 2: Batch Mode (10 minutes)

1. **Upload Multiple Files**:
   - Click "Batch Process Files"
   - Upload 3 Excel files (same structure)
   - Should navigate to `/batch`

2. **Configure**:
   - Select common sheet name
   - Add operations to pipeline
   - Click "Process All Files"

3. **Results**:
   - Should navigate to `/batch/results`
   - Should show summary: "3 file(s) processed successfully"
   - Click "Download All (ZIP)"
   - ZIP should download with 3 files

**Expected Result**: ✅ ZIP contains 3 transformed files

---

### Test 3: Merge Mode (10 minutes)

1. **Upload Files**:
   - Click "Merge Multiple Files"
   - Upload 2 Excel files:
     - File 1: Sales.xlsx (order_id, product_id, quantity)
     - File 2: Products.xlsx (product_id, product_name, price)
   - Should navigate to `/merge`

2. **Configure Merge**:
   - Select "Join" strategy
   - Enter join column: "product_id"
   - Select "Inner Join"
   - Click "Merge Files"

3. **Results**:
   - Should navigate to `/merge/results`
   - Should show merged file info
   - Click "Continue to Transform"
   - Should navigate to `/preview` with merged file

**Expected Result**: ✅ Merged file has combined columns

---

## 🐛 Debugging Tips

### If Preview Shows "No Data Available":

1. **Check Console**:
   - Look for "API call starting..." log
   - Check for error messages

2. **Check Network Tab**:
   - Find `/api/v1/preview-sheet` request
   - Check status code:
     - 200 = Success (check response body)
     - 422 = Validation error (check error detail)
     - 404 = File not found
     - 500 = Server error

3. **Check Backend Logs**:
   - Look for errors in terminal
   - Check if file exists in uploads/

4. **Verify File**:
   - Ensure Excel file has data in selected sheet
   - Ensure sheet name matches exactly (case-sensitive)

### If Batch ZIP Download Fails:

1. **Check zipUrl**:
   - Should be `/api/v1/download-batch-zip?zipId=...`
   - Check Network tab for download request

2. **Check Backend**:
   - Verify ZIP file exists in OUTPUT_DIR
   - Check backend logs for errors

3. **Try Direct URL**:
   - Copy zipUrl from response
   - Open in new tab: `http://localhost:8000{zipUrl}`

### If Merge Fails:

1. **Check File Count**:
   - Merge requires at least 2 files
   - Error should show if only 1 file uploaded

2. **Check Join Column**:
   - Column must exist in both files
   - Column name must match exactly

3. **Check Backend**:
   - Verify merge endpoint called
   - Check response for errors

---

## ✅ Success Criteria

All tests pass if:
- ✅ Preview shows data rows
- ✅ Batch processes all files and downloads ZIP
- ✅ Merge combines files correctly
- ✅ No console errors
- ✅ No white screen crashes
- ✅ Error messages are user-friendly

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Single File Mode:
[ ] Upload works
[ ] Preview shows data
[ ] Pipeline builds
[ ] Download works

Batch Mode:
[ ] Multiple upload works
[ ] Pipeline applies to all files
[ ] ZIP downloads correctly

Merge Mode:
[ ] Multiple upload works
[ ] Merge strategies work
[ ] Merged file accessible

Issues Found:
1. 
2. 
3. 

Notes:
```
