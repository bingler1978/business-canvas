# Business Canvas Testing Checklist

## Basic Functionality
- [ ] Server starts without errors
- [ ] Client connects to server successfully
- [ ] Multiple users can connect simultaneously

## Note Management
- [ ] Can add new notes to any section
- [ ] Can delete existing notes
- [ ] Notes persist between page refreshes
- [ ] Notes sync between multiple users

## AI Functionality
- [ ] AI suggestion button is visible in each section
- [ ] Clicking AI button triggers suggestion request
- [ ] AI suggestions appear in modal
- [ ] AI suggestions are relevant to the selected section
- [ ] Error handling works when AI service fails

## User Interface
- [ ] All sections of the canvas are visible
- [ ] User list shows connected users
- [ ] Modal opens and closes correctly
- [ ] Canvas layout remains stable

## Steps to Test AI Functionality
1. Click AI suggestion button in any section
2. Verify loading state appears
3. Check if suggestion appears in modal
4. Try adding the suggestion as a note
5. Verify the suggestion appears in the correct section

## Version Information
Current Version: 1.0.2
Last Verified Date: [Date]
Tested By: [Name]

Note: Complete this checklist before and after making any significant changes to ensure all functionality remains intact.
