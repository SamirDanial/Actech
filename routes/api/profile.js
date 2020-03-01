const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const { check, validationResult } = require('express-validator');

// @route   GET api/profile/me
// @dis     Get current users profile
// @access  private

router.get('/me', auth, async (req, res) => {
    try{
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name','email']);

        if(!profile) {
            return res.status(400).json({msg:'There is no profile associated for this user'});
        }

        res.json(profile);
    } catch(err){
        console.error(err.message);
        res.status(401).json({msg:"Authorization failed, access denied"});
    }
});

module.exports = router;

// @route   POST api/profile
// @dis     Get current users profile
// @access  private

router.post('/', [auth, check('status', 'Status should not be empty').not().isEmpty(), check('skills', 'Skills should not be empty').not().isEmpty()], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {
        company,
        location,
        website,
        bio,
        skills,
        status,
        githubusername,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook
      } = req.body;

      const profileFields = {};
      profileFields.user = req.user.id;
      if(company) profileFields.company = company;
      if(website) profileFields.website = website;
      if(location) profileFields.location = location;
      if(bio) profileFields.bio = bio;
      if(status) profileFields.status = status;
      if(githubusername) profileFields.githubusername = githubusername;
      if(skills)
        {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

      profileFields.social = {};
      if(youtube) profileFields.social.youtube = youtube;
      if(twitter) profileFields.social.twitter = twitter;
      if(instagram) profileFields.social.instagram = instagram;
      if(linkedin) profileFields.social.linkedin = linkedin;
      if(facebook) profileFields.social.facebook = facebook;
    
    try{
        let profile = await Profile.findOne({user: req.user.id});
    
        // Update
        if(profile) {
            profile = await Profile.findOneAndUpdate({user: req.user.id},{$set:profileFields},{new: true});
            return res.json(profile);
        }

        // Create
        profile = new Profile(profileFields);

        await profile.save();

        res.json(profile);
    }catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/profile
// @dis     Get all profile
// @access  public

router.get('/', async (req,res) => {
    try {
        const profiles = await Profile.find().populate('user',['name', 'avatar']);
        return res.json(profiles);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/profile/user/:user_id
// @dis     Get profile by user id
// @access  public

router.get('/user/:user_id', async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user',['name', 'avatar']);

        if(!profile) return res.status(400).json({msg: 'Profile not found'});

        return res.json(profile);
    } catch (error) {
        console.error(error.message);
        if(error.kind = 'ObjectId') {
            return res.status(400).json({msg: 'Profile not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   Delete api/profiles
// @dis     Delete profile, user & post
// @access  private

router.delete('/', auth, async (req,res) => {
    try {
        // todo - Remove users posts

        // Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        // Remove user
        await User.findOneAndRemove({ _id: req.user.id });

        return res.json({msg:"User deleted"});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile/Exprience
// @dis     Add profile exprience
// @access  private

router.put('/Exprience', [auth, [check('title', 'Title is required').not().isEmpty(),
 check('company', 'Company is required').not().isEmpty(),
 check('from', 'From date is required').not().isEmpty()]], async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty) {
        return res.status(400).json({errors: errors.array()});
    }
    const {title, company, location, from, to, current, description} = req.body;
    const newExp = {title, company, location, from, to, current, description};
    try {
        const profile = await Profile.findOne({user: req.user.id});
        profile.exprience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile/Exprience/:exp_id
// @dis     Delete exprience from profile
// @access  private

router.delete('/Exprience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id});
        
        // Get remove index
        const removeIndex = profile.exprience.map(item => item.id).indexOf(req.params.exp_id);

        profile.exprience.splice(removeIndex, 1);

        await profile.save();
        return res.json(profile);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({msg: 'Server Error'});
    }
});

// @route   PUT api/profile/education
// @dis     Add profile education
// @access  private
router.put('/education', [auth ,
[
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty){
        return res.json({errors: errors.array()});
    }
    try {
    
        // const {school, degree, fieldofstudy, from, to, current, description} = req.body;
        // const education = {school, degree, fieldofstudy, from, to, current, description};
        const profile = await Profile.findOne({user: req.user.id});
        profile.education.unshift(req.body);
        await profile.save();
        return res.json(profile);
        
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile/education/:edu_id
// @dis     Delete profile education
// @access  private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try{

        const profile = await Profile.findOne({user: req.user.id});
    
        // Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.exp_id);
    
        profile.education.splice(removeIndex, 1);
    
        await profile.save();
        return res.json(profile);
    }catch (error) {
    console.error(error.message);
    return res.status(500).json({msg: 'Server Error'});
}
})

module.exports = router;