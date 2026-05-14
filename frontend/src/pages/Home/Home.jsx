import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ListChecks, Target, Users, ShieldCheck } from 'lucide-react'
import './Home.css'
import { useEffect } from 'react'
import { getToken } from '../../utils/session'

const Home = () => {
  const navigate = useNavigate()
  
  useEffect(()=>{
    const token = getToken()
    if(token){
      navigate("/dashboard")
    }
  },[navigate])
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut'
        }
    }
  }

  return (
    <div className="home-container">
      <motion.section 
        className="hero-section"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Team work, tasks, and decisions in one place.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            Coordinate teams, track work, discuss decisions, and keep project context visible.
          </motion.p>
          
          <motion.div className="hero-actions">
            <Link to="/register" className="cta-btn main-cta">
              Create Account
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        className="qualities-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="qualities-grid">
          <motion.div className="quality-card" variants={fadeInUp}>
            <ListChecks size={40} className="quality-icon" />
            <h3>Task Planning</h3>
            <p>Turn project goals into task lists your team can review, assign, and track.</p>
          </motion.div>

          <motion.div className="quality-card" variants={fadeInUp}>
            <Users size={40} className="quality-icon" />
            <h3>Team Access</h3>
            <p>Create open teams, private teams, and approval flows for new members.</p>
          </motion.div>
          
          <motion.div className="quality-card" variants={fadeInUp}>
            <ShieldCheck size={40} className="quality-icon" />
            <h3>Clear Roles</h3>
            <p>Owners can assign responsibilities and keep membership changes visible.</p>
          </motion.div>
          
          <motion.div className="quality-card" variants={fadeInUp}>
            <Target size={40} className="quality-icon" />
            <h3>Work Visibility</h3>
            <p>See team membership, task status, discussion history, and progress in one workflow.</p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        className="register-cta-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="cta-box">
          <h2>Start with a shared workspace.</h2>
          <p>Create a team, invite members, and keep project work organized from the first day.</p>
          <Link to="/register" className="cta-btn final-cta">
            Create Account
          </Link>
        </div>
      </motion.section>
    </div>
  )
}

export default Home
