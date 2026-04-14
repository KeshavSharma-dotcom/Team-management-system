import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BrainCircuit, Target, Users, Zap, ShieldCheck } from 'lucide-react'
import './Home.css'

const Home = () => {
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

  const pulse = {
    hidden: { scale: 1 },
    visible: {
        scale: [1, 1.03, 1],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'loop'
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
            The Future of Teamwork is <span>Smart.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            Effortless collaboration. AI-powered focus. TeamControl makes managing people, tasks, and discussions simpler for the modern era.
          </motion.p>
          
          <motion.div 
            className="hero-actions"
            variants={pulse}
          >
            <Link to="/register" className="cta-btn main-cta">
              Get Started for Free <Zap size={18} className="zap-icon" />
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
            <BrainCircuit size={40} className="quality-icon" />
            <h3>AI-Assisted</h3>
            <p>Don't brainstorm alone. Let Gemini AI suggest specific tasks based on your project goals.</p>
          </motion.div>

          <motion.div className="quality-card" variants={fadeInUp}>
            <Users size={40} className="quality-icon" />
            <h3>Flexible Teams</h3>
            <p>Create public groups or keep things secret with locked teams needing passcodes.</p>
          </motion.div>
          
          <motion.div className="quality-card" variants={fadeInUp}>
            <ShieldCheck size={40} className="quality-icon" />
            <h3>Total Control</h3>
            <p>Owners can set specific permissions, promoting members to Sub-admins for moderation.</p>
          </motion.div>
          
          <motion.div className="quality-card" variants={fadeInUp}>
            <Target size={40} className="quality-icon" />
            <h3>Real Clarity</h3>
            <p>See exactly who is in which team, who is working on what task, and when things get done.</p>
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
          <h2>Stop managing chaos. Start managing flow.</h2>
          <p>Register now to unlock the potential of intelligent team control. Secure, modern, and built for you.</p>
          <Link to="/register" className="cta-btn final-cta">
            Register to Get Started
          </Link>
        </div>
      </motion.section>
    </div>
  )
}

export default Home